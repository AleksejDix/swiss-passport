// Names and explanations of key terms in the page language, for the topic figures. In German the term is the
// name; in the other languages a definition starts with the translated name: "Name: …" (or "Name, …").
const find = (concepts, lang, topic, term) => {
  const k = concepts[topic].key_terms.find((k) => k.term === term);
  if (!k) throw new Error(`key term ${term} missing in ${lang}/${topic}`);
  return k;
};

/** "Bundesrat" (de), "Federal Council" (en), … */
export const termName = (concepts, lang, topic, term) =>
  lang === "de" ? term : find(concepts, lang, topic, term).definition.split(/[:,]/)[0].trim();

/** The definition without the name in front of it. */
export const termText = (concepts, lang, topic, term) => {
  const d = find(concepts, lang, topic, term).definition;
  return lang === "de" ? d : d.replace(/^[^:]*:\s*/, "");
};
