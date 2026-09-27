// The state of /learn and what the learner (or an agent in the browser) can do: see the overview, start a lesson,
// reviews or a mock exam, answer, go on, change the language. The components only show this state; the islands on
// the page (the app and the language buttons in the masthead) share it, because they import the same module.
// Progress lives on the server under the learner code, which the browser remembers.
import type { Text } from "../../../i18n/index.js";
import {
  ROUTES,
  request,
  type Action,
  type Answered,
  type Concept,
  type ExamFinished,
  type Images,
  type LessonFinished,
  type Letter,
  type Progress,
  type Result,
  type Step,
} from "./api.ts";
import { storage } from "./storage.ts";

/** The interface texts of every language (i18n/<code>.json, key learn), with the language's own name. */
export type LearnTexts = Record<string, Text["learn"] & { name: string }>;
export type Kind = "lesson" | "review" | "exam";

/** What follows the feedback: the next step, or the end of the round. */
type After = { next: Step; images: Images } | { finished: LessonFinished };

export type Screen =
  | { name: "loading" }
  | { name: "error" }
  | { name: "overview"; progress: Progress }
  | {
      name: "step";
      step: Step;
      images: Images;
      title: string;
      /** The explanation of the topic, once the round has introduced it (not in mock exams). */
      concept?: Concept;
      /** The letter sent, while the answer is on its way. */
      chosen?: Letter;
      /** The answer and its feedback, once it is back. */
      answered?: { letter: Letter; feedback: Answered["feedback"] };
    }
  | { name: "summary"; finished: LessonFinished }
  | { name: "exam-result"; result: ExamFinished };

const START: Record<string, Kind> = { start_lesson: "lesson", start_reviews: "review", start_mock_exam: "exam" };

class Learn {
  texts: LearnTexts = {};
  lang = $state("");
  code = $state<string | null>(null);
  screen = $state<Screen>({ name: "loading" });
  kind: Kind = "lesson";
  #after: After | null = null;
  // Topic explanations seen in this session, so every question of a topic can offer it again.
  #concepts = new Map<string, Concept>();

  /** The texts in the current language. */
  get t() {
    return this.texts[this.lang];
  }

  get languages() {
    return Object.keys(this.texts);
  }

  /** Called once by the app with the texts from the page. */
  init(texts: LearnTexts) {
    this.texts = texts;
    this.lang = currentLang(Object.keys(texts));
    this.code = storage.get("sp-code");
  }

  /** Runs one learning action. A new learner gets a code first. */
  async call<T>(name: Action, { learner_code = this.code, ...args }: Record<string, unknown> = {}) {
    let json: Record<string, unknown> | undefined;
    let code = learner_code;
    if (!code) {
      json = await request("/learners", { language: this.lang });
      code = json.learner_code as string;
    }
    if (!(json && name === "get_progress")) {
      json = await request(ROUTES[name], { learner_code: code, language: this.lang, ...args });
    }
    const { images, ...data } = json as Record<string, unknown> & { images?: Images };
    const result = data as Result<T>;
    if (result.learner_code && !result.error) {
      this.code = result.learner_code;
      storage.set("sp-code", result.learner_code);
    }
    return { data: result, images: images ?? {} };
  }

  #show(screen: Screen) {
    this.screen = screen;
    this.#after = null;
    window.scrollTo({ top: 0 });
  }

  fail() {
    this.#show({ name: "error" });
  }

  /** The overview: progress, what to do next and the learner code. */
  home = async (): Promise<Progress | undefined> => {
    let progress: Result<Progress>;
    try {
      ({ data: progress } = await this.call<Progress>("get_progress"));
    } catch {
      this.fail();
      return;
    }
    if (progress.error) {
      // The stored code is unknown on the server: start fresh.
      this.code = null;
      return this.home();
    }
    this.#show({ name: "overview", progress });
    return progress;
  };

  /** Continues with a code the learner typed in. False when the server does not know it. */
  useCode = async (entered: string) => {
    const { data } = await this.call<Progress>("get_progress", { learner_code: entered }).catch(() => ({
      data: { error: true },
    }));
    if (data.error) return false;
    this.home();
    return true;
  };

  /** Starts a lesson, reviews or a mock exam and shows its first question. */
  start = async (action: Action, args: Record<string, unknown> = {}) => {
    this.kind = START[action];
    try {
      const { data, images } = await this.call<Step>(action, args);
      if (!data.question) await this.home();
      else this.#showStep(data, images);
      return data;
    } catch {
      this.fail();
    }
  };

  #showStep(step: Step, images: Images, lessonTitle?: string) {
    const t = this.t;
    const title = step.lesson
      ? `${t.lesson} ${step.lesson.position.split("/")[0]}: ${step.lesson.title}`
      : (lessonTitle ?? (this.kind === "exam" ? t.exam : t.reviews));
    if (step.explain_first) this.#concepts.set(step.explain_first.title, step.explain_first);
    const concept = this.kind === "exam" ? undefined : this.#concepts.get(step.concept);
    this.#show({ name: "step", step, images, title, concept });
  }

  /** Answers the question on the screen. In a mock exam, goes straight on; otherwise shows the feedback. */
  answer = async (letter: Letter) => {
    const screen = this.screen;
    if (screen.name !== "step" || screen.chosen || screen.answered) return;
    screen.chosen = letter;
    let result: { data: Result<Answered>; images: Images };
    try {
      result = await this.call<Answered>("answer", { answer: letter });
    } catch {
      this.fail();
      return;
    }
    const { data, images } = result;
    if (data.error) {
      await this.home();
      return;
    }
    if (this.kind === "exam") {
      // No feedback in the mock exam: straight to the next question or the result.
      if (data.next) this.#showStep(data.next, images, screen.title);
      else this.#show({ name: "exam-result", result: data.finished! });
      return data;
    }
    screen.chosen = undefined;
    screen.answered = { letter, feedback: data.feedback };
    this.#after = data.next ? { next: data.next, images } : { finished: data.finished! };
    return data;
  };

  /** After the feedback: can the learner go on? */
  get waiting() {
    return this.#after !== null;
  }

  /** Goes on to the next question, or to the summary at the end of the round. */
  proceed = () => {
    const after = this.#after;
    if (!after) return;
    const title = this.screen.name === "step" ? this.screen.title : undefined;
    if ("next" in after) this.#showStep(after.next, after.images, title);
    else this.#show({ name: "summary", finished: after.finished });
  };

  setLang = (id: string) => {
    this.lang = id;
    storage.set("sp-lang", id);
    return this.home();
  };
}

/** The learner's language: saved choice, else the browser's language, else English. */
function currentLang(languages: string[]) {
  const saved = storage.get("sp-lang");
  if (saved && languages.includes(saved)) return saved;
  return navigator.languages.map((l) => l.slice(0, 2)).find((l) => languages.includes(l)) ?? "en";
}

export const learn = new Learn();
