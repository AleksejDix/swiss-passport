// Which topic shows which figure (issues #1 to #8). A figure appears on its topics' pages and on the pages of
// all their questions; the pages ask this registry instead of knowing each figure.
import { HISTORY, TIMELINE_TEXT } from "./history.js";
import { PARLIAMENT_TEXT } from "./parliament.js";
import { FEDERAL_COUNCIL_TEXT } from "./federal-council.js";
import { POWERS_TEXT } from "./powers.js";

const VISUALS = {
  history: { topics: HISTORY.map((e) => e.topic), title: (lang) => TIMELINE_TEXT[lang].title },
  parliament: { topics: ["parliament_chambers", "parliament_tasks"], title: (lang) => PARLIAMENT_TEXT[lang].title },
  federalCouncil: { topics: ["federal_council", "administration"], title: (lang) => FEDERAL_COUNCIL_TEXT[lang].title },
  powers: { topics: ["separation_of_powers", "justice_police", "zh_government", "zh_parliament"], title: (lang) => POWERS_TEXT[lang].title },
};

/** The figure of a topic ("history", "parliament", …), or undefined. */
export const visualFor = (topic) => Object.keys(VISUALS).find((k) => VISUALS[k].topics.includes(topic));
export const visualTitle = (topic, lang) => VISUALS[visualFor(topic)].title(lang);
