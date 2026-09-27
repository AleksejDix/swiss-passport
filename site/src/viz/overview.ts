// "All 350 questions at a glance" on the homepage (issue #2): labels from the language files in i18n/.
// Counts come from curriculum.json; "questions" takes the plural form the language needs (Intl.PluralRules).
import { texts } from "../i18n.ts";

/** "10 Fragen", "4 вопроса", "13 вопросов". */
export function countLabel(lang: string, n: number) {
  const forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string } = texts(lang).site.viz.overview.q;
  return `${n} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
}
