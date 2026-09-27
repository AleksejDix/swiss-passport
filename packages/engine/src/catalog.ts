// What a catalog is: the questions of one exam, the curriculum that teaches them and all texts per language.
// The engine gets a catalog passed in and never reads content files itself.

/** An option's id, usually a letter: "a", "b", … */
export type OptionId = string;
/** One option, or a list of options for questions where the learner picks every right one. */
export type Answer = OptionId | OptionId[];

/** The options of an answer as a list. */
export const answerList = (answer: Answer): OptionId[] => [answer].flat();

/** Right when the learner picked exactly the right options, in any order. */
export function isRight(given: Answer, answer: Answer): boolean {
  const right = new Set(answerList(answer));
  const picked = new Set(answerList(given));
  return picked.size === right.size && [...picked].every((o) => right.has(o));
}

export interface Question {
  id: string;
  category: string;
  level: string;
  image?: string;
  /** What a right answer is worth in lesson, review and exam results (default 1). */
  points?: number;
  /** Two or more options, e.g. a and b for true or false. */
  options: { id: OptionId; image?: string }[];
  /** One option, or a list (even of one) when the learner picks every right option: shown as checkboxes. */
  answer: Answer;
}
export interface Curriculum {
  units: { id: string; lessons: string[] }[];
  /** requires: lessons to finish first. Lessons without it can be started right away. */
  lessons: { id: string; unit: string; requires?: string[]; concepts: string[] }[];
  concepts: { id: string; lesson: string; questions: string[]; sources: string[] }[];
}
/** The stage of every lesson: 0 when it requires nothing, else one more than its latest prerequisite. */
export function lessonStages(curriculum: Curriculum): Map<string, number> {
  const byId = new Map(curriculum.lessons.map((l) => [l.id, l]));
  const stages = new Map<string, number>();
  const stageOf = (id: string): number => {
    let stage = stages.get(id);
    if (stage === undefined) {
      const requires = byId.get(id)!.requires ?? [];
      stage = requires.length ? 1 + Math.max(...requires.map(stageOf)) : 0;
      stages.set(id, stage);
    }
    return stage;
  };
  for (const l of curriculum.lessons) stageOf(l.id);
  return stages;
}

export interface KeyTerm {
  term: string;
  definition: string;
}
export interface TextConcept {
  title: string;
  intro: string[];
  key_terms: KeyTerm[];
  mnemonic?: string;
}
export interface TextQuestion {
  question: string;
  options: Record<OptionId, string>;
  why?: string;
  /** Why a wrong option is wrong, shown to a learner who picked it. */
  distractors?: Record<OptionId, string>;
  note?: string;
}
export interface Texts {
  title: string;
  categories: Record<string, string>;
  levels: Record<string, string>;
  units?: Record<string, { title: string }>;
  lessons?: Record<string, { title: string }>;
  concepts?: Record<string, TextConcept>;
  questions: Record<string, TextQuestion>;
}

/** How topics come back for review. */
export interface ReviewSchedule {
  /** Days a topic waits at each level: level 1 waits days[0], the last level the last delay. */
  days: number[];
  /** true: a right answer at the last level finishes the topic for good. false: it keeps coming back. */
  finish?: boolean;
  /** "halve": a mistake halves the level. "step": one level back, and back after the first delay. */
  mistake?: "halve" | "step";
}

export interface Catalog {
  exam: {
    /** Named in the tutor's instructions, e.g. "the knowledge test of the Canton of Zurich". */
    name: string;
    /** Questions per mock exam. */
    size: number;
    /** Told to the learner with the mock exam result. */
    pass_mark: string;
  };
  /** Without it: after 2, 7, 21 and 60 days, then finished; a mistake halves the level (DEFAULT_REVIEW). */
  review?: ReviewSchedule;
  /** The first language is the language of the exam: the fallback for missing texts, and shown alongside as "original". */
  languages: readonly string[];
  questions: Question[];
  curriculum: Curriculum;
  texts: Record<string, Texts>;
}

/** Lookups over a catalog, and its texts in the learner's language with the exam language as fallback. */
export function indexCatalog(catalog: Catalog) {
  const { curriculum, texts } = catalog;
  const examLang = catalog.languages[0];
  const original = texts[examLang];

  const questions = new Map(catalog.questions.map((q) => [q.id, q]));
  const conceptOfQuestion = new Map(curriculum.concepts.flatMap((c) => c.questions.map((q) => [q, c.id] as const)));
  const conceptById = new Map(curriculum.concepts.map((c) => [c.id, c]));
  const lessonById = new Map(curriculum.lessons.map((l) => [l.id, l]));
  const lessonOrder = curriculum.lessons.map((l) => l.id);

  const unitTitle = (id: string, lang: string): string => texts[lang].units?.[id]?.title ?? original.units![id].title;
  const lessonTitle = (id: string, lang: string): string =>
    texts[lang].lessons?.[id]?.title ?? original.lessons![id].title;
  const categoryTitle = (id: string, lang: string): string => texts[lang].categories[id] ?? original.categories[id];
  const conceptText = (id: string, lang: string): TextConcept => texts[lang].concepts?.[id] ?? original.concepts![id];

  /** Question text in the learner's language, without the answer. */
  function questionText(id: string, lang: string) {
    const q = questions.get(id)!;
    const t = texts[lang].questions[id] ?? original.questions[id];
    const o = original.questions[id];
    return {
      id,
      question: t.question,
      options: t.options,
      // Pick every right option (checkboxes), not just one.
      ...(Array.isArray(q.answer) && { multiple: true }),
      ...(q.image && { image: q.image }),
      ...(q.options.some((o) => o.image) && {
        option_images: Object.fromEntries(q.options.map((o) => [o.id, o.image])),
      }),
      // The real exam is in its own language: always show the original wording too.
      ...(lang !== examLang && { original: { question: o.question, options: o.options } }),
    };
  }

  /** Explanation for a given answer, in the learner's language. Answer fields are lists when the question's is. */
  function explanation(id: string, given: Answer, lang: string) {
    const q = questions.get(id)!;
    const t = texts[lang].questions[id] ?? {};
    const o = original.questions[id];
    const pick = <K extends keyof TextQuestion>(k: K) => (t[k] ?? o[k]) as TextQuestion[K];
    const optionText = (options: Record<OptionId, string>) =>
      Array.isArray(q.answer) ? q.answer.map((a) => options[a]) : options[q.answer];
    const correct = isRight(given, q.answer);
    // Why the options the learner picked wrongly are wrong.
    const about = answerList(given)
      .filter((g) => !answerList(q.answer).includes(g))
      .map((g) => pick("distractors")?.[g])
      .filter(Boolean)
      .join(" ");
    return {
      correct,
      your_answer: given,
      correct_answer: q.answer,
      correct_answer_text: optionText(t.options ?? o.options),
      ...(lang !== examLang && { correct_answer_original: optionText(o.options) }),
      why: pick("why"),
      ...(!correct && about && { about_your_answer: about }),
      ...(pick("note") && { note: pick("note") }),
    };
  }

  return {
    curriculum,
    questions,
    conceptOfQuestion,
    conceptById,
    lessonById,
    lessonOrder,
    unitTitle,
    lessonTitle,
    categoryTitle,
    conceptText,
    questionText,
    explanation,
  };
}
