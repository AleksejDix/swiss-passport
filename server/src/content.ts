// The quiz content (questions, curriculum, texts per language), bundled into the server so it needs no files
// at runtime (also on Cloudflare Workers). Resolves texts in the learner's language, falling back to German.
import quizJson from "../../quiz.json" with { type: "json" };
import curriculumJson from "../../curriculum.json" with { type: "json" };
import de from "../../i18n/de.json" with { type: "json" };
import en from "../../i18n/en.json" with { type: "json" };
import fr from "../../i18n/fr.json" with { type: "json" };
import it from "../../i18n/it.json" with { type: "json" };
import ru from "../../i18n/ru.json" with { type: "json" };
import uk from "../../i18n/uk.json" with { type: "json" };

export const LANGUAGES = ["de", "en", "fr", "it", "ru", "uk"] as const;
export type Lang = (typeof LANGUAGES)[number];
export type Letter = "a" | "b" | "c" | "d";

interface QuizQuestion {
  id: string;
  category: string;
  level: string;
  image?: string;
  options: { id: Letter; image?: string }[];
  answer: Letter;
}
interface Curriculum {
  units: { id: string; lessons: string[] }[];
  lessons: { id: string; unit: string; concepts: string[] }[];
  concepts: { id: string; lesson: string; questions: string[]; sources: string[] }[];
}
interface KeyTerm { term: string; definition: string }
interface TextConcept { title: string; intro: string[]; key_terms: KeyTerm[]; mnemonic?: string }
interface TextQuestion {
  question: string;
  options: Record<Letter, string>;
  why?: string;
  distractors?: Partial<Record<Letter, string>>;
  note?: string;
}
interface Texts {
  title: string;
  categories: Record<string, string>;
  levels: Record<string, string>;
  units?: Record<string, { title: string }>;
  lessons?: Record<string, { title: string }>;
  concepts?: Record<string, TextConcept>;
  questions: Record<string, TextQuestion>;
}

const quiz = quizJson as unknown as { questions: QuizQuestion[] };
export const curriculum = curriculumJson as Curriculum;
const texts = { de, en, fr, it, ru, uk } as unknown as Record<Lang, Texts>;

export const questions = new Map(quiz.questions.map((q) => [q.id, q]));
export const conceptOfQuestion = new Map(
  curriculum.concepts.flatMap((c) => c.questions.map((q) => [q, c.id] as const)),
);
export const conceptById = new Map(curriculum.concepts.map((c) => [c.id, c]));
export const lessonById = new Map(curriculum.lessons.map((l) => [l.id, l]));
export const lessonOrder = curriculum.lessons.map((l) => l.id);

export const isLang = (x: unknown): x is Lang => LANGUAGES.includes(x as Lang);

export function unitTitle(id: string, lang: Lang): string {
  return texts[lang].units?.[id]?.title ?? texts.de.units![id].title;
}
export function lessonTitle(id: string, lang: Lang): string {
  return texts[lang].lessons?.[id]?.title ?? texts.de.lessons![id].title;
}
export function categoryTitle(id: string, lang: Lang): string {
  return texts[lang].categories[id] ?? texts.de.categories[id];
}

export function conceptText(id: string, lang: Lang): TextConcept {
  return texts[lang].concepts?.[id] ?? texts.de.concepts![id];
}

/** Question text in the learner's language, without the answer. */
export function questionText(id: string, lang: Lang) {
  const q = questions.get(id)!;
  const t = texts[lang].questions[id] ?? texts.de.questions[id];
  const de = texts.de.questions[id];
  return {
    id,
    question: t.question,
    options: t.options,
    ...(q.image && { image: q.image }),
    ...(q.options.some((o) => o.image) && {
      option_images: Object.fromEntries(q.options.map((o) => [o.id, o.image])),
    }),
    // The real exam is in German: always show the original wording too.
    ...(lang !== "de" && { german: { question: de.question, options: de.options } }),
  };
}

/** Explanation for a given answer, in the learner's language. */
export function explanation(id: string, given: Letter, lang: Lang) {
  const q = questions.get(id)!;
  const t = texts[lang].questions[id] ?? {};
  const de = texts.de.questions[id];
  const pick = <K extends keyof TextQuestion>(k: K) => (t[k] ?? de[k]) as TextQuestion[K];
  const correct = given === q.answer;
  return {
    correct,
    your_answer: given,
    correct_answer: q.answer,
    correct_answer_text: (t.options ?? de.options)[q.answer],
    ...(lang !== "de" && { correct_answer_german: de.options[q.answer] }),
    why: pick("why"),
    ...(!correct && pick("distractors")?.[given] && { about_your_answer: pick("distractors")![given] }),
    ...(pick("note") && { note: pick("note") }),
  };
}

