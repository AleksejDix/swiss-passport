// The catalog of the Zurich knowledge test: questions, curriculum and texts per language from the repository
// root, bundled into the server so it needs no files at runtime (also on Cloudflare Workers). The languages
// and all their texts come from i18n/index.js.
import type { Catalog, Question } from "./engine/index.js";
import quiz from "../../quiz.json" with { type: "json" };
import curriculum from "../../curriculum.json" with { type: "json" };
import { TEXTS, LANGUAGES, byLang } from "../../i18n/index.js";

// German first: the exam is in German.
export { LANGUAGES };
export type Lang = (typeof LANGUAGES)[number];

/** The quiz card's labels in each language (i18n/<code>.json, key card), sent along with every card. */
export const CARD_LABELS = byLang((t) => t.card as CardLabels);
export interface CardLabels { right: string; wrongIs: string; again: string; next: string; done: string }

export const catalog: Catalog = {
  exam: {
    name: "the Swiss naturalisation knowledge test (Grundkenntnistest) of the Canton of Zurich",
    size: 50,
    pass_mark: "not officially published by the Canton of Zurich",
  },
  languages: LANGUAGES,
  questions: quiz.questions as Question[],
  curriculum,
  texts: TEXTS as unknown as Catalog["texts"],
};
