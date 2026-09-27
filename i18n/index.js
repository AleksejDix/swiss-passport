// All learner languages in one place. Each language is one file, i18n/<code>.json, with every text in that
// language: the quiz content (questions, topics, lessons) and the interface of the website, /learn and the quiz
// card (keys site, learn and card). German comes first: the exam is in German.
// To add a language: translate de.json into <code>.json with the same keys, then add it to the imports and to TEXTS.
import de from "./de.json" with { type: "json" };
import en from "./en.json" with { type: "json" };
import fr from "./fr.json" with { type: "json" };
import it from "./it.json" with { type: "json" };
import ru from "./ru.json" with { type: "json" };
import uk from "./uk.json" with { type: "json" };
import es from "./es.json" with { type: "json" };
import sq from "./sq.json" with { type: "json" };

export const TEXTS = { de, en, fr, it, ru, uk, es, sq };

/** The language codes in order: ["de", "en", ...]. */
export const LANGUAGES = Object.keys(TEXTS);

// Texts can say how many languages there are ({language_count}) and name them ({languages_or}), in their own
// language: both always follow the list above.
function vars(lang) {
  const tag = TEXTS[lang].language;
  const names = new Intl.DisplayNames([tag], { type: "language" });
  return {
    language_count: String(LANGUAGES.length),
    languages_or: new Intl.ListFormat(tag, { type: "disjunction" }).format(LANGUAGES.map((l) => names.of(l))),
  };
}

function fill(value, v) {
  if (typeof value === "string") return value.replace(/\{(language_count|languages_or)\}/g, (_, key) => v[key]);
  if (Array.isArray(value)) return value.map((x) => fill(x, v));
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, x]) => [k, fill(x, v)]));
  return value;
}

/** One value per language, taken from its file: byLang((t) => t.site.ui) gives { de: …, en: …, … }. */
export const byLang = (pick) => Object.fromEntries(LANGUAGES.map((l) => [l, fill(pick(TEXTS[l]), vars(l))]));

/** Each language's name in itself, for language pickers: { de: "Deutsch", en: "English", … }. */
export const LANGUAGE_NAMES = byLang((t) => t.name);
