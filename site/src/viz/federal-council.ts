// The Federal Council figure (issue #4). The seven departments are read from the topic's own explanation
// (administration, second paragraph), which lists them in the same order in every language:
// "Name (ABBR)" or, in English, "Name (ABBR, German: GERMAN)". The German abbreviation comes from the German text.
import { byLang } from "../../../i18n/index.js";

export const FEDERAL_COUNCIL_TEXT = byLang((t) => t.site.viz.federal_council);

// Separators and articles before a name: ", ", "und ", "das ", "the ", "l'" …
const LEAD = /^\s*(?:,\s*|(?:und|and|et|e|и|та)\s+)?(?:(?:das|the|le|la|il|lo)\s+|l')?/iu;

/** [{ name, abbr }] from "… are: A (X), B (Y) and C (Z). …" */
export function departments(paragraph: string) {
  const list = paragraph.slice(paragraph.indexOf(":") + 1, paragraph.lastIndexOf(")") + 1);
  return [...list.matchAll(/([^()]+?)\s*\(([^)]+)\)/gu)].map(([, name, inBrackets]) => {
    const clean = name.replace(LEAD, "").trim();
    return { name: clean.charAt(0).toUpperCase() + clean.slice(1), abbr: inBrackets.split(",")[0].trim() };
  });
}
