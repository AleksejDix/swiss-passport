// The catalog of the Zurich knowledge test: questions, curriculum and texts per language from the repository
// root, bundled into the server so it needs no files at runtime (also on Cloudflare Workers).
import type { Catalog, Question } from "./engine/index.js";
import quiz from "../../quiz.json" with { type: "json" };
import curriculum from "../../curriculum.json" with { type: "json" };
import de from "../../i18n/de.json" with { type: "json" };
import en from "../../i18n/en.json" with { type: "json" };
import fr from "../../i18n/fr.json" with { type: "json" };
import it from "../../i18n/it.json" with { type: "json" };
import ru from "../../i18n/ru.json" with { type: "json" };
import uk from "../../i18n/uk.json" with { type: "json" };

// German first: the exam is in German.
export const LANGUAGES = ["de", "en", "fr", "it", "ru", "uk"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const catalog: Catalog = {
  exam: {
    name: "the Swiss naturalisation knowledge test (Grundkenntnistest) of the Canton of Zurich",
    size: 50,
    pass_mark: "not officially published by the Canton of Zurich",
  },
  languages: LANGUAGES,
  questions: quiz.questions as Question[],
  curriculum,
  texts: { de, en, fr, it, ru, uk } as unknown as Catalog["texts"],
};
