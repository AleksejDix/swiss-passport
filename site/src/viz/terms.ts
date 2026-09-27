// Names and explanations of key terms in the page language, for the topic figures. In German the term is the
// name; in the other languages a definition starts with the translated name: "Name: …" (or "Name, …").
import type { ConceptText } from "../i18n.ts";

type Concepts = Record<string, ConceptText>;

const find = (concepts: Concepts, lang: string, topic: string, term: string) => {
  const k = concepts[topic].key_terms.find((k) => k.term === term);
  if (!k) throw new Error(`key term ${term} missing in ${lang}/${topic}`);
  return k;
};

/** "Bundesrat" (de), "Federal Council" (en), … */
export const termName = (concepts: Concepts, lang: string, topic: string, term: string) =>
  lang === "de" ? term : find(concepts, lang, topic, term).definition.split(/[:,]/)[0].trim();

/** The definition without the name in front of it. */
export const termText = (concepts: Concepts, lang: string, topic: string, term: string) => {
  const d = find(concepts, lang, topic, term).definition;
  if (lang === "de") return d;
  const rest = d.replace(/^[^:]*:\s*/, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1); // "Majorité des cantons : la majorité …" → "La majorité …"
};
