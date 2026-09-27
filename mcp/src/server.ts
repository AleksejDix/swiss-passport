// The MCP server: tools, tutoring instructions and the quiz card. Used locally (stdio) and online (HTTP).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Assets } from "./assets.js";
import { catalog, CARD_LABELS, LANGUAGES, type Lang } from "./catalog.js";
import { REVIEW_SIZE } from "@aleksejdix/learning-engine";
import { createLearning, engine, type Done, type Out } from "./learning.js";
import { BLOCK_SECONDS, type Guard } from "./guard.js";
import type { Store } from "./store.js";

export const VERSION = "0.9.0";

const { exam } = catalog;

const INSTRUCTIONS = `
You are a patient tutor for ${exam.name}.
The tools hold the official questions and verified explanations and hand them out ONE STEP AT A TIME.

Rules:
- Language: ask which language the learner wants (${LANGUAGES.join(", ")}) and pass it as "language".
  Speak in that language. The real exam is in German: always also show the German wording ("german") of the question.
- Start of a session: call get_progress. If reviews are due, call start_reviews first. Otherwise offer the learner
  two or three lessons from "lesson_choices" (the first one is recommended) and call start_lesson with the chosen lesson_id.
  If there is an unfinished session, offer to continue it (the start tools restart it).
- Each tool result contains exactly one step. Show ONLY that step:
  - If it has "explain_first": explain that concept briefly and clearly, using only its intro, key_terms and mnemonic.
  - Then ask the one question with options a) to d). Stop and wait for the learner's reply.
- Quiz card: where the host shows it, the card already shows the step (concept, question, options, pictures), checks
  the learner's clicks itself and shows the feedback. Then, in a text chat, do not repeat any of that: say one short line
  and wait. The card tells you what the learner answered. If a click arrives as a chat message instead, answer it.
  In a voice conversation, read the step aloud anyway (see below).
- When the learner replies in the chat (typed or spoken), call answer with their letter.
  Never judge the answer yourself and never reveal the correct answer beforehand.
  Give short feedback from "why", "about_your_answer" and "note" (if "note" says the exam answer is outdated,
  teach the exam answer and mention today's fact). Then show the next step from "next".
- A wrong answer comes back later in the same round ("retry": true) until the learner gets it right. Encourage them;
  do not give away the answer again when it comes back.
- Mock exam (start_mock_exam): ask the ${exam.size} questions one by one without any feedback. The result comes after the last answer.
  The pass mark is ${exam.pass_mark}.
- Never add facts that are not in the tool results. Keep messages short and encouraging.
- Questions with pictures come with images. Where the quiz card is shown, the learner sees them there.

Voice conversations (the learner speaks and listens):
- Pass voice: true to the start tools. Picture questions are then left out.
- Speak naturally and briefly: no tables, lists, emojis, markdown or question ids. Explain a concept in 2 to 3 sentences.
- Read the question, then the options as "A: ..., B: ..., C: ..., D: ...". Say the German question only if the
  learner uses German or asks for it; always say the German key term once.
- The learner may answer with the letter or with the words of an option: map it to the letter. If unclear, ask again.
- Feedback in one or two sentences, then go straight to the next question.
`.trim();

const ONLINE_INSTRUCTIONS = `

Learner code (online version, no login):
- Progress is saved under a personal learner code, e.g. "BERG-7K2Q". At the start, ask whether the learner has one.
- Pass it as "learner_code" in EVERY tool call. If the learner has none, leave it empty: the first start_lesson,
  start_reviews or start_mock_exam returns a new "learner_code" (get_progress only reads and creates none).
  Tell the learner to write it down: they need it to continue on another day.
- If you can remember things between conversations, remember the learner's code.`;

const WEBSITE = "https://swiss-passport.com";
// Shown next to the app in AI apps that read the server's icons (the site's favicon, also as PNG).
const ICONS = [
  { src: `${WEBSITE}/icon-512.png`, mimeType: "image/png", sizes: ["512x512"] },
  { src: `${WEBSITE}/favicon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
];

// Hosts cache the card by this URI (ChatGPT): give it a new version when the card changes.
const CARD_URI = "ui://swiss-passport/card-v7.html";
// The card loads nothing from the network: its script is inline and pictures come as data: URIs in the tool result.
// ChatGPT reads its own keys (widgetDomain is required in its plugin directory). The standard ui.domain is left out:
// Claude expects a hash of the server URL there, not the site's origin.
const CARD_META = {
  ui: { csp: { connectDomains: [], resourceDomains: [] } },
  "openai/widgetCSP": { connect_domains: [], resource_domains: [] },
  "openai/widgetDomain": WEBSITE,
  "openai/widgetDescription":
    "Quiz card: shows the current step (concept, question, options) and checks the learner's clicks itself. Do not repeat it in the chat.",
};

// The tools only change the learner's own quiz progress in this app's database: nothing is deleted,
// nothing is sent to other systems. Explicit, because MCP treats unannotated tools as destructive and open-world.
const changesProgress = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const cardUi = { ui: { resourceUri: CARD_URI } };
// In the tool descriptions too: some hosts (ChatGPT) do not read the server instructions.
// Written as facts, not orders: ChatGPT flagged "do not repeat ... never judge answers" as a suspicious instruction
// and asked the learner to allow every call.
const CARD_NOTE =
  " In apps with the quiz card, the card shows this step (concept, question, options, pictures), checks the learner's clicks" +
  " and shows the feedback: the learner already sees all of it there, and the same text in the chat shows it twice." +
  " Every call shows a new card. In a voice conversation the step is read aloud." +
  " Answers typed or spoken in the chat are checked and saved by the answer tool with the learner's letter.";
// In every step of a voice session: ChatGPT's voice mode ignored the card note, asked its own questions and saved nothing.
const VOICE_STEP =
  "Voice conversation: the feedback (if any) fits in one or two sentences, explain_first (if any) in two or three." +
  " Then comes this question with its options A to D, read aloud. The learner's spoken answer is checked and saved by the" +
  " answer tool with their letter; the quiz uses only these questions.";

/** A result as the model sees it next to the card: which step it is, without the texts and options the card shows. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any tool result of the engine
function forModel({ explain_first, question, next, ...rest }: Record<string, any>): Record<string, unknown> {
  return {
    ...rest,
    // No question id: ChatGPT passed it on as question_id, the card's sign for a click, and got the whole step back.
    ...(question && { question: question.question, shown_on_card: true }),
    ...(next && { next: forModel(next) }),
  };
}

/**
 * Tool result: JSON text and pictures for the model, plus the same data for the quiz card (structuredContent).
 * `cardOnly`: ChatGPT gives the model structuredContent too and repeated the whole card in the chat. There the card
 * gets its data in _meta (only the card sees it), and the model a short version without the pictures.
 */
async function toResult(assets: Assets, { data, questionId }: Out, lang?: Lang, cardOnly = false) {
  const q = questionId ? engine.question(questionId) : undefined;
  const files: [string, string, string][] = q
    ? [
        ...(q.image ? [["question", "Picture for the question", q.image] as [string, string, string]] : []),
        ...q.options.filter((o) => o.image).map((o) => [o.id, `Option ${o.id}`, o.image!] as [string, string, string]),
      ]
    : [];
  const pictures = await Promise.all(
    files.map(async ([key, label, file]) => ({
      key,
      label,
      mimeType: file.endsWith(".png") ? "image/png" : "image/jpeg",
      data: await assets.image(file),
    })),
  );
  const card = {
    lang,
    labels: CARD_LABELS[lang ?? LANGUAGES[0]],
    data,
    images: Object.fromEntries(pictures.map((p) => [p.key, `data:${p.mimeType};base64,${p.data}`])),
  };
  if (cardOnly) {
    const brief = forModel(data);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(brief) }],
      structuredContent: brief,
      _meta: { card },
    };
  }
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(data) },
      ...pictures.flatMap((p) => [
        { type: "text" as const, text: p.label },
        { type: "image" as const, data: p.data, mimeType: p.mimeType },
      ]),
    ],
    structuredContent: card,
  };
}

/**
 * Creates the server. `online` adds the learner code: without login, progress is stored per code.
 * Locally there is one learner and progress lives in a file.
 */
/** Told instead of any result while a client waits after too many wrong learner codes (guard.ts). */
const BLOCKED = `Too many wrong learner codes from this connection: requests with a learner code are paused for ${BLOCK_SECONDS / 60} minutes.`;

/**
 * `guard` and `client` (the caller's IP address): limits on wrong learner codes, as in the REST API. Missing locally.
 */
export function createServer(
  store: Store,
  { online, assets, guard, client = "local" }: { online: boolean; assets: Assets; guard?: Guard; client?: string },
) {
  const server = new McpServer(
    { name: "swiss-passport-zh", title: "Swiss Passport", version: VERSION, websiteUrl: WEBSITE, icons: ICONS },
    { instructions: online ? INSTRUCTIONS + ONLINE_INSTRUCTIONS : INSTRUCTIONS },
  );

  server.registerResource(
    "Quiz card",
    CARD_URI,
    { mimeType: "text/html;profile=mcp-app", _meta: CARD_META },
    async () => ({
      contents: [{ uri: CARD_URI, mimeType: "text/html;profile=mcp-app", text: await assets.card(), _meta: CARD_META }],
    }),
  );

  const common = {
    language: z
      .enum(LANGUAGES)
      .optional()
      .describe("Learner's language. The start tools and answer remember it for next time."),
    ...(online && {
      // ChatGPT called the code an "access token" and asked the learner before sharing it with the app that issued it.
      learner_code: z
        .string()
        .optional()
        .describe(
          "Progress code this app gave the learner, e.g. BERG-7K2Q. Not a password or account token: it only points to quiz progress, which holds no personal data. Empty on first use: the first start_lesson, start_reviews or start_mock_exam creates a new code.",
        ),
    }),
  };
  const voice = z
    .boolean()
    .default(false)
    .describe("true in voice conversations: leaves out questions that need pictures.");

  // Finding the learner, loading and saving progress and what each tool does: learning.ts, shared with the REST API.
  const learning = createLearning(store, { online });

  /**
   * Runs a learning action and returns the MCP result.
   * `request` is the tool call's context: ChatGPT sends its own "openai/..." keys in _meta.
   */
  async function run(request: { _meta?: object }, who: { learner_code?: string }, action: () => Promise<Done>) {
    // Guessing learner codes: a client with too many wrong codes waits, a wrong code counts against it.
    const withCode = online && Boolean(guard) && who.learner_code !== undefined;
    if (withCode && (await guard!.blocked(client))) return toResult(assets, { data: { error: BLOCKED } });
    const done = await action();
    if (withCode && done.out.status === 404) await guard!.wrongCode(client);
    const { out, lang, learnerCode, created, voice } = done;
    // Online without a learner (unknown code): only the error.
    if (online && !learnerCode) return toResult(assets, out);
    if (voice && out.questionId) out.data = { voice_instructions: VOICE_STEP, ...out.data };
    if (online)
      out.data = {
        learner_code: learnerCode,
        ...(created && { new_learner_code: "Tell the learner to write this code down." }),
        ...out.data,
      };
    // In voice conversations the model reads the step aloud, so it needs all of it.
    const chatgpt = Object.keys(request._meta ?? {}).some((key) => key.startsWith("openai/"));
    return toResult(assets, out, lang, chatgpt && !voice);
  }

  server.registerTool(
    "get_progress",
    {
      title: "Learning progress",
      description:
        `Use this first when the user wants to learn for ${exam.name} (Swiss citizenship, Einbürgerung, Swiss passport). ` +
        "Returns lessons done, reviews due, unfinished session, readiness per topic and recent mock exams.",
      inputSchema: common,
      // Only reads, also online: learner codes come from the start tools. Claude listed it with the tools that
      // write while it could create a code.
      annotations: { ...changesProgress, readOnlyHint: true, idempotentHint: true },
    },
    (args, request) => run(request, args, () => learning.readProgress(args)),
  );

  server.registerTool(
    "start_lesson",
    {
      title: "Start a lesson",
      _meta: cardUi,
      annotations: changesProgress,
      description:
        "Starts a lesson and returns its first step: a concept explanation and one question. Pick lesson_id from lesson_choices of get_progress." +
        " Without lesson_id an unfinished lesson continues where it stopped." +
        CARD_NOTE,
      inputSchema: {
        ...common,
        voice,
        lesson_id: z
          .string()
          .optional()
          .describe(
            "e.g. l05, one of lesson_choices from get_progress. Default: the unfinished lesson, otherwise the recommended next lesson.",
          ),
      },
    },
    ({ voice, lesson_id, ...args }, request) =>
      run(request, args, () => learning.startLesson(args, { lesson_id, voice })),
  );

  server.registerTool(
    "start_reviews",
    {
      title: "Start reviews",
      _meta: cardUi,
      annotations: changesProgress,
      description:
        `Starts a review round of up to ${REVIEW_SIZE} questions whose concepts are due, and returns the first one.` +
        CARD_NOTE,
      inputSchema: { ...common, voice },
    },
    ({ voice, ...args }, request) => run(request, args, () => learning.startReviews(args, { voice })),
  );

  server.registerTool(
    "start_mock_exam",
    {
      title: "Start a mock exam",
      _meta: cardUi,
      annotations: changesProgress,
      description:
        `Starts a mock exam with ${exam.size} random questions like the official practice test, and returns the first one.` +
        CARD_NOTE,
      inputSchema: { ...common, voice },
    },
    ({ voice, ...args }, request) => run(request, args, () => learning.startExam(args, { voice })),
  );

  server.registerTool(
    "answer",
    {
      title: "Answer the current question",
      // The quiz card calls this tool itself when the learner clicks an option.
      _meta: { ui: { ...cardUi.ui, visibility: ["model", "app"] }, "openai/widgetAccessible": true },
      annotations: changesProgress,
      description:
        "Submits the learner's letter for the current question. Returns feedback (none in mock exams) and the next step, or the result at the end." +
        CARD_NOTE,
      inputSchema: {
        ...common,
        answer: z.enum(["a", "b", "c", "d"]).describe("The learner's choice"),
        question_id: z.string().optional().describe("Set by the quiz card only: the question it shows."),
      },
    },
    ({ answer, question_id, ...args }, request) =>
      // A click on the card (only the card sends question_id) gets the whole step back in structuredContent, as before.
      run(question_id ? {} : request, args, () => learning.answer(args, { answer, question_id })),
  );

  return server;
}
