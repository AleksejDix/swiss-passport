// Separation of powers (issue #5): short labels from the language files in i18n/. The names of the bodies come from key terms
// (see termName); numbers of members from the explanations: Federal Council 7, National Council 200,
// Council of States 46, Cantonal Council 180, Cantonal Government 7. The texts name no specific cantonal court.
import { texts } from "../i18n.ts";

export const membersLabel = (lang: string, n: number) => {
  const forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string } = texts(lang).site.viz.powers.members;
  return `${n} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
};
