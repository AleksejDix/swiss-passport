// Separation of powers (issue #5): short labels in six languages. The names of the bodies come from key terms
// (see termName); numbers of members from the explanations: Federal Council 7, National Council 200,
// Council of States 46, Cantonal Council 180, Cantonal Government 7. The texts name no specific cantonal court.
export const POWERS_TEXT = {
  de: { title: "Gewaltenteilung", make: "macht die Gesetze", execute: "führt die Gesetze aus", judge: "urteilt nach dem Gesetz",
    federal: "Bund", canton: "Kanton Zürich", courts: "Gerichte", control: "Die drei Gewalten kontrollieren sich gegenseitig.",
    members: { one: "Mitglied", other: "Mitglieder" } },
  en: { title: "Separation of powers", make: "makes the laws", execute: "carries out the laws", judge: "judges according to the law",
    federal: "Confederation", canton: "Canton of Zurich", courts: "Courts", control: "The three powers control each other.",
    members: { one: "member", other: "members" } },
  fr: { title: "Séparation des pouvoirs", make: "fait les lois", execute: "applique les lois", judge: "juge selon la loi",
    federal: "Confédération", canton: "Canton de Zurich", courts: "Tribunaux", control: "Les trois pouvoirs se contrôlent mutuellement.",
    members: { one: "membre", other: "membres" } },
  it: { title: "Separazione dei poteri", make: "fa le leggi", execute: "applica le leggi", judge: "giudica secondo la legge",
    federal: "Confederazione", canton: "Cantone di Zurigo", courts: "Tribunali", control: "I tre poteri si controllano a vicenda.",
    members: { one: "membro", other: "membri" } },
  ru: { title: "Разделение властей", make: "принимает законы", execute: "исполняет законы", judge: "судит по закону",
    federal: "Конфедерация", canton: "Кантон Цюрих", courts: "Суды", control: "Три ветви власти контролируют друг друга.",
    members: { one: "член", few: "члена", many: "членов", other: "члена" } },
  uk: { title: "Поділ влади", make: "ухвалює закони", execute: "виконує закони", judge: "судить за законом",
    federal: "Конфедерація", canton: "Кантон Цюрих", courts: "Суди", control: "Три гілки влади контролюють одна одну.",
    members: { one: "член", few: "члени", many: "членів", other: "члена" } },
};

export const membersLabel = (lang, n) => {
  const forms = POWERS_TEXT[lang].members;
  return `${n} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
};

/** The name of a body in the page language: the German term itself, or the text before ":" or "," of its definition. */
export const termName = (concepts, lang, topic, term) => {
  const k = concepts[topic].key_terms.find((k) => k.term === term);
  if (!k) throw new Error(`key term ${term} missing in ${lang}/${topic}`);
  return lang === "de" ? term : k.definition.split(/[:,]/)[0].trim();
};
