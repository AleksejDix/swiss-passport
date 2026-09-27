// The site's texts and languages, from the language files in i18n/ (one file per language, and the only list of
// languages). texts(lang) gives all texts of one language, typed, with {language_count} and {languages_or} filled in:
// the quiz content (questions, topics, lessons, units), the interface of the site (site.*) and of /learn (learn).
import { byLang, LANGUAGES, LANGUAGE_NAMES, type Text } from "../../i18n/index.js";

export { LANGUAGES, LANGUAGE_NAMES, byLang };
export type { Text, Letter, QuestionText, ConceptText, Section } from "../../i18n/index.js";

const ALL = byLang((t) => t);

/** All texts of one language: texts("de").site.home.h1, texts(lang).questions.q055.question. */
export function texts(lang: string): Text {
  const t = ALL[lang];
  if (!t) throw new Error(`No texts for language ${lang}`);
  return t;
}
