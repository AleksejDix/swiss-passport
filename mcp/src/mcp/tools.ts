// The MCP tools: one per learning action, with the descriptions and input schemas the models read.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { REVIEW_SIZE } from "@aleksejdix/learning-engine";
import { z } from "zod";
import { catalog, LANGUAGES } from "../learning/catalog.js";
import type { Learning } from "../learning/learning.js";
import { cardUi } from "./card.js";
import type { Run } from "./result.js";
import { CARD_NOTE } from "./texts.js";

const { exam } = catalog;

// The tools only change the learner's own quiz progress in this app's database: nothing is deleted,
// nothing is sent to other systems. Explicit, because MCP treats unannotated tools as destructive and open-world.
const changesProgress = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };

/** The inputs of every tool: the language, and online the learner code. */
const commonInput = (online: boolean) => ({
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
});
const voice = z
  .boolean()
  .default(false)
  .describe("true in voice conversations: leaves out questions that need pictures.");

export function registerTools(
  server: McpServer,
  { online, learning, run }: { online: boolean; learning: Learning; run: Run },
) {
  const common = commonInput(online);

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
        " Without lesson_id an unfinished lesson continues where it stopped, and a new learner gets lesson_choices to pick from" +
        " (nothing starts yet)." +
        CARD_NOTE,
      inputSchema: {
        ...common,
        voice,
        lesson_id: z
          .string()
          .optional()
          .describe(
            "e.g. l05, one of lesson_choices from get_progress. Default: the unfinished lesson; for a new learner the choices; otherwise the recommended next lesson.",
          ),
      },
    },
    ({ voice, lesson_id, ...args }, request) =>
      run(request, args, () => learning.startLesson(args, { lesson_id, voice, newLearnerChooses: true })),
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
}
