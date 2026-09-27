// "All 350 questions at a glance" on the homepage (issue #2): labels from the language files in i18n/.
// Counts come from curriculum.json; "questions" takes the plural form the language needs (Intl.PluralRules).
import { byLang } from "../../../i18n/index.js";

export const OVERVIEW = byLang((t) => t.site.viz.overview);

/** "10 Fragen", "4 вопроса", "13 вопросов". */
export function countLabel(lang: string, n: number) {
  const forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string } = OVERVIEW[lang].q;
  return `${n} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
}
