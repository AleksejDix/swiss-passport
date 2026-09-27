// The catalog of the Zurich knowledge test and the engine that teaches it: questions, curriculum and texts per
// language from the repository root, bundled into the server so it needs no files at runtime (also on Cloudflare
// Workers). The languages and all their texts come from i18n/index.js.
import { createEngine, type Catalog, type Question } from "@aleksejdix/learning-engine";
import quiz from "../../../quiz.json" with { type: "json" };
import curriculum from "../../../curriculum.json" with { type: "json" };
import { TEXTS, LANGUAGES, byLang } from "../../../i18n/index.js";

// German first: the exam is in German.
export { LANGUAGES };
export type Lang = (typeof LANGUAGES)[number];

/** The quiz card's labels in each language (i18n/<code>.json, key card), sent along with every card. */
export const CARD_LABELS = byLang((t) => t.card as CardLabels);
export interface CardLabels {
  right: string;
  wrongIs: string;
  again: string;
  next: string;
  done: string;
}

export const catalog: Catalog = {
  exam: {
    name: "the Swiss naturalisation knowledge test (Grundkenntnistest) of the Canton of Zurich",
    size: 50,
    pass_mark: "not officially published by the Canton of Zurich",
  },
  // The schedule the site describes in every language: after a mistake one step back and again the next day.
  // Topics keep coming back until the exam instead of finishing.
  review: { days: [1, 3, 7, 14, 30], finish: false, mistake: "step" },
  languages: LANGUAGES,
  questions: quiz.questions as Question[],
  curriculum,
  texts: TEXTS as unknown as Catalog["texts"],
};

export const engine = createEngine(catalog);

/** A language asked for or stored, or the first one (German). Only languages of the catalog are ever stored. */
export const languageOf = ({ language }: { language?: string }) => (language ?? LANGUAGES[0]) as Lang;
