// Quiz content for the static pages: read at build time from the JSON files in the repository root.
import type { Curriculum, Question } from "@aleksejdix/learning-engine";
import quizFile from "../../quiz.json";
import curriculumFile from "../../curriculum.json";
import { TEXTS, LANGUAGES, type Letter } from "../../i18n/index.js";

// Every question of the Zurich test has the options a to d and exactly one right answer.
type ZurichQuestion = Omit<Question, "options" | "answer"> & {
  options: { id: Letter; image?: string }[];
  answer: Letter;
};
const quiz = quizFile as { questions: ZurichQuestion[] };
const curriculum: Curriculum = curriculumFile;
export type Unit = Curriculum["units"][number];
export type Lesson = Curriculum["lessons"][number];
export type Concept = Curriculum["concepts"][number];
/** A question of quiz.json with its official number, URL slug, topic and lesson. */
export type PageQuestion = ZurichQuestion & { n: number; slug: string; concept: Concept; lesson: string };
/** A topic with the unit of its lesson and its questions. */
export type Topic = Omit<Concept, "questions"> & { unit: string; questions: PageQuestion[] };

// All texts per language, and the language codes (German first). Languages are added in i18n/index.js only.
export const TEXT = TEXTS;
export const LANG_IDS = LANGUAGES;
export const { units, lessons, concepts } = curriculum;

// When the explanations were last checked against the official sources, shown as "Last checked" on question and
// topic pages. Change it only after a real check (see content/review_flags.md), never to the build date.
const CHECKED = new Date(Date.UTC(2026, 8, 26));
export const checkedMonth = (lang: string) =>
  new Intl.DateTimeFormat(lang, { month: "long", year: "numeric", timeZone: "UTC" }).format(CHECKED);

// Every language has its own prefix (/de/, /en/, ...); / is the language picker.
export const prefix = (lang: string) => `/${lang}`;
export const homePath = (lang: string) => `${prefix(lang)}/`;
export const questionsPath = (lang: string) => `${prefix(lang)}/questions/`;
export const questionPath = (lang: string, q: { slug: string }) => `${prefix(lang)}/questions/${q.slug}/`;
export const topicPath = (lang: string, c: { id: string }) => `${prefix(lang)}/topics/${c.id.replace(/_/g, "-")}/`;
export const guidePath = (lang: string) => `${prefix(lang)}/grundkenntnistest/`;
export const aboutPath = (lang: string) => `${prefix(lang)}/about/`;
export const methodPath = (lang: string) => `${prefix(lang)}/method/`;
export const curriculumPath = (lang: string) => `${prefix(lang)}/curriculum/`;
export const connectPath = (lang: string) => `${prefix(lang)}/connect/`;

/** A URL slug from the German question, the wording used in the real test (same slug in every language). */
function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug.length <= 60) return slug;
  return slug.slice(0, 61).replace(/-[^-]*$/, "");
}

const conceptOf = new Map(concepts.flatMap((c) => c.questions.map((id) => [id, c] as const)));
const byId = <T extends { id: string }>(list: T[], id: string) => {
  const found = list.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown id ${id}`);
  return found;
};

/** All questions in curriculum order (unit, lesson, topic), with number, slug and topic. */
export const questions: PageQuestion[] = lessons
  .flatMap((l) => l.concepts.map((id) => byId(concepts, id)))
  .flatMap((c) => c.questions)
  .map((id) => byId(quiz.questions, id))
  .map((q) => {
    const n = Number(q.id.slice(1));
    const concept = conceptOf.get(q.id)!;
    return { ...q, n, slug: `${n}-${slugify(TEXT.de.questions[q.id].question)}`, concept, lesson: concept.lesson };
  });

/** The question with this id (q055), with number, slug and topic. */
export const question = (id: string) => byId(questions, id);

/** All topics in curriculum order, each with its lesson, unit and questions. */
export const topics: Topic[] = lessons.flatMap((l) =>
  l.concepts.map((id) => {
    const c = byId(concepts, id);
    return { ...c, unit: l.unit, questions: questions.filter((q) => q.concept.id === id) };
  }),
);
