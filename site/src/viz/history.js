// Timeline of Swiss history for the history topics (lessons l22 to l26). One entry per topic; every year
// is taken from that topic's explanation in i18n/*.json. The label is the topic title without its year.
export const HISTORY = [
  { topic: "early_history", year: -58 },
  { topic: "founding_1291", year: 1291 },
  { topic: "marignano", year: 1515 },
  { topic: "reformation", year: 1523 }, // Zurich introduces the Reformation
  { topic: "helvetic_republic", year: 1798 },
  { topic: "neutrality", year: 1815 },
  { topic: "founding_1848", year: 1848 },
  { topic: "industrialisation", year: 1850, period: "c19" }, // a century, not a single year
  { topic: "general_strike", year: 1918 },
  { topic: "ww2", year: 1939, until: 1945 },
  { topic: "prosperity", year: 1948 }, // AHV pensions since 1 January 1948
  { topic: "migration_history", year: 1970 }, // Schwarzenbach initiative
  { topic: "women_rights", year: 1971 },
  { topic: "jura", year: 1979 },
];

export const isHistory = (topic) => HISTORY.some((e) => e.topic === topic);

export const TIMELINE_TEXT = {
  de: { title: "Zeitleiste der Schweizer Geschichte", bc: (y) => `${y} v. Chr.`, c19: "19. Jh." },
  en: { title: "Timeline of Swiss history", bc: (y) => `${y} BC`, c19: "19th c." },
  fr: { title: "Chronologie de l'histoire suisse", bc: (y) => `${y} av. J.-C.`, c19: "XIXe s." },
  it: { title: "Cronologia della storia svizzera", bc: (y) => `${y} a.C.`, c19: "XIX sec." },
  ru: { title: "Хронология истории Швейцарии", bc: (y) => `${y} г. до н. э.`, c19: "XIX в." },
  uk: { title: "Хронологія історії Швейцарії", bc: (y) => `${y} р. до н. е.`, c19: "XIX ст." },
};

/** The year column: "58 BC", "1291", "1939–1945", "19th c.". */
export function yearLabel(e, lang) {
  const t = TIMELINE_TEXT[lang];
  if (e.period) return t[e.period];
  if (e.year < 0) return t.bc(-e.year);
  return e.until ? `${e.year}–${e.until}` : String(e.year);
}

/** A topic title without the year it already shows in the year column ("1291, …", "… since 1815", "… 1918 года"). */
export function withoutYear(title) {
  const t = title
    .replace(/^\d{4}(\s(год|рік))?\s?[,:]\s*/u, "")
    .replace(/(\s(of|de|del|dal|seit|since|depuis|с|з))?,?\s\d{4}(\s(год|года|року|рік))?$/u, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}
