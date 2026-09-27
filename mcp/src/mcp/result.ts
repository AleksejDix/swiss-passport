// From a learning action to an MCP tool result: the limits on wrong learner codes, the notes for the model, and the
// result itself with its pictures, for the model and for the quiz card.
import type { Assets } from "../assets.js";
import { guarded, type Guard } from "../guard.js";
import { CARD_LABELS, LANGUAGES, languageOf, type Lang } from "../learning/catalog.js";
import type { Done, Learner, Out } from "../learning/learning.js";
import { questionPictures } from "../learning/pictures.js";
import { BLOCKED, NEW_CODE, NEW_OR_CONTINUING, VOICE_STEP } from "./texts.js";

/** The tool call's context: ChatGPT sends its own "openai/..." keys in _meta. */
export interface ToolRequest {
  _meta?: object;
}

const isChatGpt = (request: ToolRequest) => Object.keys(request._meta ?? {}).some((key) => key.startsWith("openai/"));

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

/** The pictures of the step's question, loaded and labelled for the model. */
function loadPictures(assets: Assets, questionId: string | undefined) {
  return Promise.all(
    questionPictures(questionId).map(async ({ key, file }) => ({
      key,
      label: key === "question" ? "Picture for the question" : `Option ${key}`,
      mimeType: file.endsWith(".png") ? "image/png" : "image/jpeg",
      data: await assets.image(file),
    })),
  );
}

/**
 * Tool result: JSON text and pictures for the model, plus the same data for the quiz card (structuredContent).
 * `cardOnly`: ChatGPT gives the model structuredContent too and repeated the whole card in the chat. There the card
 * gets its data in _meta (only the card sees it), and the model a short version without the pictures.
 */
async function toResult(assets: Assets, { data, questionId }: Out, lang?: Lang, cardOnly = false) {
  const pictures = await loadPictures(assets, questionId);
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

/** The step with what the model needs besides it: in voice sessions how to read it, online the learner code. */
function withNotes({ out, learnerCode, created, voice }: Done, online: boolean): Out {
  const data = voice && out.questionId ? { voice_instructions: VOICE_STEP, ...out.data } : out.data;
  if (!online) return { ...out, data };
  return { ...out, data: { learner_code: learnerCode, ...(created && { new_learner_code: NEW_CODE }), ...data } };
}

/**
 * Runs learning actions as tools. `guard` and `client` (the caller's IP address): limits on wrong learner codes,
 * as in the REST API. Missing locally.
 */
export function createRunner({
  online,
  assets,
  guard,
  client,
}: {
  online: boolean;
  assets: Assets;
  guard?: Guard;
  client: string;
}) {
  return async function run(request: ToolRequest, who: Learner, action: () => Promise<Done>) {
    // Online, every chat first asks whether the learner starts from scratch or continues with their code.
    if (online && !who.learner_code && !who.new_learner)
      return toResult(assets, { data: NEW_OR_CONTINUING }, languageOf(who));
    // Guessing learner codes: a client with too many wrong codes waits, a wrong code counts against it.
    const withCode = online && who.learner_code !== undefined;
    const done = await guarded(withCode ? guard : undefined, client, action);
    if (!done) return toResult(assets, { data: { error: BLOCKED } });
    // Online without a learner (unknown code): only the error.
    if (online && !done.learnerCode) return toResult(assets, done.out);
    // In voice conversations the model reads the step aloud, so it needs all of it.
    return toResult(assets, withNotes(done, online), done.lang, isChatGpt(request) && !done.voice);
  };
}

export type Run = ReturnType<typeof createRunner>;
