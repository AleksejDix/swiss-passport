// The learning actions for one learner, shared by the MCP tools (mcp/) and the REST API (api/): find the learner,
// run the step (steps.ts) on their progress, save it. How a result is sent (MCP content, quiz card, JSON over HTTP)
// is up to the caller.
import { emptyProgress } from "@aleksejdix/learning-engine";
import type { Store } from "../store/store.js";
import { engine, languageOf, type Lang } from "./catalog.js";
import { learnerFinder, type Learners } from "./learners.js";
import * as steps from "./steps.js";
import type { AnswerOptions, LessonOptions, Out, StartOptions, Step } from "./steps.js";

export type { Learners, Out };

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

/** For a learner without a code: where the code comes from. A fact, not an order (see CARD_NOTE in mcp/texts.ts). */
const NO_CODE_YET =
  "This learner has no learner code yet. start_lesson, start_reviews and start_mock_exam create one with their first step." +
  " For a new learner, start_lesson without lesson_id shows lesson_choices on the card, where the learner picks where to start.";

// API v1 and the tutor's instructions call the wording of the real exam "german"; the engine calls it "original".
const V1_NAMES: Record<string, string> = { original: "german", correct_answer_original: "correct_answer_german" };
function v1Names(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(v1Names);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [V1_NAMES[k] ?? k, v1Names(v)]));
  return value;
}

/** A result that belongs to no learner: an error, or what a learner without a code sees. */
const withoutLearner = (out: Out, who: Learner): Done => ({ out, lang: languageOf(who), created: false, voice: false });

export function createLearning(store: Store, { learners }: { learners: Learners }) {
  const online = learners !== "local";
  const find = learnerFinder(store, learners);

  /** Runs a step for the learner: finds (or makes) them, remembers their language and saves the progress. */
  async function run(
    who: Learner,
    step: Step,
    { create = learners === "by-code-or-new", save = true } = {},
  ): Promise<Done> {
    const found = await find(who.learner_code, create);
    if ("error" in found) return withoutLearner(found.error, who);
    const { id, progress: p, created } = found;
    engine.fitToCatalog(p); // questions removed from the catalog since the last visit
    if (who.language) p.language = who.language;
    const lang = languageOf(p);
    const out = step(p, lang);
    out.data = v1Names(out.data) as Out["data"];
    if (save) await store.save(id, p);
    return { out, lang, ...(online && { learnerCode: id }), created, voice: Boolean(p.session?.voice) };
  }

  return {
    /** A new learner with a new code (REST API, POST /learners). */
    newLearner: (language?: Lang) => run({ language }, steps.progress(), { create: true }),

    progress: (who: Learner) => run(who, steps.progress()),

    /**
     * Progress without changing anything (MCP get_progress, marked read-only so that Claude does not list it with the
     * tools that write): no new learner code and nothing saved. A learner without a code gets the empty progress.
     */
    readProgress: async (who: Learner): Promise<Done> => {
      if (!online || who.learner_code) return run(who, steps.progress(), { create: false, save: false });
      const data = { no_learner_code_yet: NO_CODE_YET, ...engine.progress(emptyProgress(), languageOf(who)) };
      return withoutLearner({ data }, who);
    },

    startLesson: (who: Learner, options: LessonOptions) => run(who, steps.lesson(options)),
    startReviews: (who: Learner, options: StartOptions) => run(who, steps.reviews(options)),
    startExam: (who: Learner, options: StartOptions) => run(who, steps.exam(options)),
    answer: (who: Learner, options: AnswerOptions) => run(who, steps.answer(options)),
  };
}

export type Learning = ReturnType<typeof createLearning>;
