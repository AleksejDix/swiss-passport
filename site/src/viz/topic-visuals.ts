// Which topic shows which figure (issues #1 to #8, maps #13 and #14). A figure appears on its topics' pages and on the pages of
// all their questions; the pages ask this registry instead of knowing each figure.
import { HISTORY } from "./history.ts";
import { termName } from "./terms.ts";
import { MAP_OF_TOPIC } from "./maps.ts";
import { texts } from "../i18n.ts";

const VISUALS: Record<string, { topics: string[]; title: (lang: string) => string }> = {
  history: { topics: HISTORY.map((e) => e.topic), title: (lang) => texts(lang).site.viz.timeline.title },
  parliament: {
    topics: ["parliament_chambers", "parliament_tasks"],
    title: (lang) => texts(lang).site.viz.parliament.title,
  },
  federalCouncil: {
    topics: ["federal_council", "administration"],
    title: (lang) => texts(lang).site.viz.federal_council.title,
  },
  powers: {
    topics: ["separation_of_powers", "justice_police", "zh_government", "zh_parliament"],
    title: (lang) => texts(lang).site.viz.powers.title,
  },
  levels: { topics: ["three_levels", "federal_tasks"], title: (lang) => texts(lang).site.viz.levels.title },
  pillars: { topics: ["three_pillars", "ahv_iv"], title: (lang) => texts(lang).concepts.three_pillars.title },
  // Not on the referendum topic: an optional referendum needs only the majority of the people.
  majority: {
    topics: ["double_majority", "initiative"],
    title: (lang) => termName(texts(lang).concepts, lang, "double_majority", "Ständemehr"),
  },
  map: { topics: Object.keys(MAP_OF_TOPIC), title: (lang) => texts(lang).site.viz.map.map },
};

/** The figure of a topic ("history", "parliament", …), or undefined. */
export const visualFor = (topic: string) => Object.keys(VISUALS).find((k) => VISUALS[k].topics.includes(topic));
export const visualTitle = (topic: string, lang: string) => VISUALS[visualFor(topic)!].title(lang);
