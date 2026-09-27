// Quiz content for the static pages: read at build time from the JSON files in the repository root.
import quiz from "../../quiz.json";
import curriculum from "../../curriculum.json";
import { TEXTS, LANGUAGES } from "../../i18n/index.js";

// All texts per language, and the language codes (German first). Languages are added in i18n/index.js only.
export const TEXT = TEXTS;
export const LANG_IDS = LANGUAGES;
export const { units, lessons, concepts } = curriculum;

// When the explanations were last checked against the official sources, shown as "Last checked" on question and
// topic pages. Change it only after a real check (see content/review_flags.md), never to the build date.
const CHECKED = new Date(Date.UTC(2026, 8, 26));
export const checkedMonth = (lang) => new Intl.DateTimeFormat(lang, { month: "long", year: "numeric", timeZone: "UTC" }).format(CHECKED);

// Every language has its own prefix (/de/, /en/, ...); / is the language picker.
export const prefix = (lang) => `/${lang}`;
export const homePath = (lang) => `${prefix(lang)}/`;
export const questionsPath = (lang) => `${prefix(lang)}/questions/`;
export const questionPath = (lang, q) => `${prefix(lang)}/questions/${q.slug}/`;
export const topicPath = (lang, c) => `${prefix(lang)}/topics/${c.id.replace(/_/g, "-")}/`;
export const guidePath = (lang) => `${prefix(lang)}/grundkenntnistest/`;
export const aboutPath = (lang) => `${prefix(lang)}/about/`;
export const methodPath = (lang) => `${prefix(lang)}/method/`;
export const connectPath = (lang) => `${prefix(lang)}/connect/`;

/** A URL slug from the German question, the wording used in the real test (same slug in every language). */
function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (slug.length <= 60) return slug;
  return slug.slice(0, 61).replace(/-[^-]*$/, "");
}

const conceptOf = new Map(concepts.flatMap((c) => c.questions.map((id) => [id, c])));

/** All questions in curriculum order (unit, lesson, topic), with number, slug and topic. */
export const questions = lessons
  .flatMap((l) => l.concepts.map((id) => concepts.find((c) => c.id === id)))
  .flatMap((c) => c.questions)
  .map((id) => quiz.questions.find((q) => q.id === id))
  .map((q) => {
    const n = Number(q.id.slice(1));
    const concept = conceptOf.get(q.id);
    return { ...q, n, slug: `${n}-${slugify(TEXT.de.questions[q.id].question)}`, concept, lesson: concept.lesson };
  });

/** All topics in curriculum order, each with its lesson, unit and questions. */
export const topics = lessons.flatMap((l) =>
  l.concepts.map((id) => {
    const c = concepts.find((k) => k.id === id);
    return { ...c, unit: l.unit, questions: questions.filter((q) => q.concept.id === id) };
  }),
);
