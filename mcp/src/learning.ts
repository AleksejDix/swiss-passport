// The learning actions for one learner, shared by the MCP tools (server.ts) and the REST API (api.ts):
// finding the learner by code (or creating one), loading and saving progress, and what each action asks
// of the engine. How a result is sent (MCP content, quiz card, JSON over HTTP) is up to the caller.
import { createEngine, emptyProgress, type Letter, type Progress } from "@aleksejdix/learning-engine";
import { catalog, LANGUAGES, type Lang } from "./catalog.js";
import { newLearnerCode, normalizeCode, type Store } from "./store.js";

export const engine = createEngine(catalog);

/** What an action produces: data, the question whose pictures belong to it, and a status for HTTP (default 200). */
export interface Out {
  data: Record<string, unknown>;
  questionId?: string;
  status?: number;
}

/** Who asks: the learner code (online) and the language, which is remembered for next time. */
export interface Learner {
  language?: Lang;
  learner_code?: string;
}

/** An action's result. `learnerCode` is missing when no learner could be found (online) or locally. */
export interface Done {
  out: Out;
  lang: Lang;
  learnerCode?: string;
  created: boolean;
  /** The learner is in a voice session (no picture questions). */
  voice: boolean;
}

/** For a learner without a code: where the code comes from. A fact, not an order (see CARD_NOTE in server.ts). */
const NO_CODE_YET =
  "This learner has no learner code yet. start_lesson, start_reviews and start_mock_exam create one with their first step.";

const stepOut = (p: Progress, lang: Lang): Out => {
  const step = engine.currentStep(p.session!, lang);
  return { data: step, questionId: step.question.id };
};

/**
 * The actions. `online`: learners are identified by a learner code, without login. Locally (Claude Desktop)
 * there is one learner. `create: false` refuses to make a new learner code (the REST API creates codes only
 * with POST /learners).
 */
export function createLearning(store: Store, { online }: { online: boolean }) {
  async function forLearner(
    who: Learner,
    fn: (p: Progress, lang: Lang) => Out,
    create = true,
    save = true,
  ): Promise<Done> {
    let id = "local";
    let created = false;
    let p: Progress | undefined;
    const fallback = (who.language ?? LANGUAGES[0]) as Lang;
    if (!online) {
      p = await store.load(id);
    } else if (who.learner_code) {
      id = normalizeCode(who.learner_code);
      p = await store.load(id);
      if (!p) {
        const error = `Unknown learner code "${who.learner_code}". Check it, or leave learner_code empty to start fresh.`;
        return { out: { data: { error }, status: 404 }, lang: fallback, created, voice: false };
      }
    } else if (!create) {
      return {
        out: { data: { error: "A learner code is needed." }, status: 401 },
        lang: fallback,
        created,
        voice: false,
      };
    } else {
      do id = newLearnerCode();
      while (await store.load(id));
      created = true;
    }
    p ??= emptyProgress();
    if (who.language) p.language = who.language;
    const lang = (p.language ?? LANGUAGES[0]) as Lang; // only languages of the catalog are ever stored
    const out = fn(p, lang);
    if (save) await store.save(id, p);
    return { out, lang, ...(online && { learnerCode: id }), created, voice: Boolean(p.session?.voice) };
  }

  return {
    progress: (who: Learner, create = true) =>
      forLearner(who, (p, lang) => ({ data: engine.progress(p, lang) }), create),

    /**
     * Progress without changing anything (MCP get_progress, marked read-only so that Claude does not list it with the
     * tools that write): no new learner code and nothing saved. A learner without a code gets the empty progress.
     */
    readProgress: async (who: Learner): Promise<Done> => {
      if (online && !who.learner_code) {
        const lang = (who.language ?? LANGUAGES[0]) as Lang;
        const data = { no_learner_code_yet: NO_CODE_YET, ...engine.progress(emptyProgress(), lang) };
        return { out: { data }, lang, created: false, voice: false };
      }
      return forLearner(who, (p, lang) => ({ data: engine.progress(p, lang) }), false, false);
    },

    startLesson: (who: Learner, { lesson_id, voice = false }: { lesson_id?: string; voice?: boolean }, create = true) =>
      forLearner(
        who,
        (p, lang) => {
          // "Let's continue" in a new chat: ChatGPT called start_lesson and the learner lost their place in the lesson.
          const open = p.session?.kind === "lesson" && !!p.session.voice === voice ? p.session.lesson : undefined;
          if (open && (lesson_id ?? open) === open) {
            // Said explicitly: without it ChatGPT started the same lesson a second time, and two cards showed the same step.
            const out = stepOut(p, lang);
            return { ...out, data: { continued_unfinished_lesson: true, ...out.data } };
          }
          const id = lesson_id ?? engine.nextLessonId(p);
          if (!id) return { data: { done: true, message: "All lessons done. Continue with reviews and mock exams." } };
          if (!engine.lessons.includes(id))
            return {
              data: { error: `Unknown lesson ${id}. Lessons are ${engine.lessons[0]} to ${engine.lessons.at(-1)}.` },
              status: 400,
            };
          engine.startLesson(p, id, voice);
          return stepOut(p, lang);
        },
        create,
      ),

    startReviews: (who: Learner, { voice = false }: { voice?: boolean }, create = true) =>
      forLearner(
        who,
        (p, lang) =>
          engine.startReviews(p, voice)
            ? stepOut(p, lang)
            : { data: { nothing_due: true, message: "No reviews due. Continue with a lesson." } },
        create,
      ),

    startExam: (who: Learner, { voice = false }: { voice?: boolean }, create = true) =>
      forLearner(
        who,
        (p, lang) => {
          engine.startExam(p, voice);
          return stepOut(p, lang);
        },
        create,
      ),

    answer: (who: Learner, { answer, question_id }: { answer: Letter; question_id?: string }, create = true) =>
      forLearner(
        who,
        (p, lang) => {
          if (!p.session)
            return {
              data: { error: "No active session. Call start_lesson, start_reviews or start_mock_exam." },
              status: 409,
            };
          // A screen still showing an earlier question: answer nothing and bring it to the current step.
          if (question_id && question_id !== p.session.questions[p.session.pos]) {
            const out = stepOut(p, lang);
            return { ...out, data: { question_already_answered: true, ...out.data } };
          }
          const r = engine.answer(p, answer, lang);
          return { data: r, questionId: "next" in r ? r.next?.question.id : undefined };
        },
        create,
      ),
  };
}

export type Learning = ReturnType<typeof createLearning>;
