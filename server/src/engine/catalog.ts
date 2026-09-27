// What a catalog is: the questions of one exam, the curriculum that teaches them and all texts per language.
// The engine gets a catalog passed in and never reads content files itself.

export type Letter = "a" | "b" | "c" | "d";

export interface Question {
  id: string;
  category: string;
  level: string;
  image?: string;
  options: { id: Letter; image?: string }[];
  answer: Letter;
}
export interface Curriculum {
  units: { id: string; lessons: string[] }[];
  /** requires: lessons to finish first. Lessons without it can be started right away. */
  lessons: { id: string; unit: string; requires?: string[]; concepts: string[] }[];
  concepts: { id: string; lesson: string; questions: string[]; sources: string[] }[];
}
interface KeyTerm { term: string; definition: string }
export interface TextConcept { title: string; intro: string[]; key_terms: KeyTerm[]; mnemonic?: string }
interface TextQuestion {
  question: string;
  options: Record<Letter, string>;
  why?: string;
  distractors?: Partial<Record<Letter, string>>;
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

export interface Catalog {
  exam: {
    /** Named in the tutor's instructions, e.g. "the knowledge test of the Canton of Zurich". */
    name: string;
    /** Questions per mock exam. */
    size: number;
    /** Told to the learner with the mock exam result. */
    pass_mark: string;
  };
  /** The first language is the language of the exam: the fallback for missing texts, and always shown alongside. */
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
  const conceptOfQuestion = new Map(
    curriculum.concepts.flatMap((c) => c.questions.map((q) => [q, c.id] as const)),
  );
  const conceptById = new Map(curriculum.concepts.map((c) => [c.id, c]));
  const lessonById = new Map(curriculum.lessons.map((l) => [l.id, l]));
  const lessonOrder = curriculum.lessons.map((l) => l.id);

  const unitTitle = (id: string, lang: string): string => texts[lang].units?.[id]?.title ?? original.units![id].title;
  const lessonTitle = (id: string, lang: string): string => texts[lang].lessons?.[id]?.title ?? original.lessons![id].title;
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
      ...(q.image && { image: q.image }),
      ...(q.options.some((o) => o.image) && {
        option_images: Object.fromEntries(q.options.map((o) => [o.id, o.image])),
      }),
      // The real exam is in its own language: always show the original wording too.
      ...(lang !== examLang && { german: { question: o.question, options: o.options } }),
    };
  }

  /** Explanation for a given answer, in the learner's language. */
  function explanation(id: string, given: Letter, lang: string) {
    const q = questions.get(id)!;
    const t = texts[lang].questions[id] ?? {};
    const o = original.questions[id];
    const pick = <K extends keyof TextQuestion>(k: K) => (t[k] ?? o[k]) as TextQuestion[K];
    const correct = given === q.answer;
    return {
      correct,
      your_answer: given,
      correct_answer: q.answer,
      correct_answer_text: (t.options ?? o.options)[q.answer],
      ...(lang !== examLang && { correct_answer_german: o.options[q.answer] }),
      why: pick("why"),
      ...(!correct && pick("distractors")?.[given] && { about_your_answer: pick("distractors")![given] }),
      ...(pick("note") && { note: pick("note") }),
    };
  }

  return {
    curriculum, questions, conceptOfQuestion, conceptById, lessonById, lessonOrder,
    unitTitle, lessonTitle, categoryTitle, conceptText, questionText, explanation,
  };
}
