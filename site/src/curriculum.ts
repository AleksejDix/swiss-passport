// The curriculum page: units, lessons and which lesson builds on which (requires in curriculum.json).
// The texts come from the language files in i18n/ (site.curriculum).
import { lessonStages } from "@aleksejdix/learning-engine";
import { byLang } from "../../i18n/index.js";
import { units, lessons, concepts } from "./data.ts";

export const CURRICULUM = byLang((t) => t.site.curriculum);

// The stages come from the learning engine, so the page and the lessons offered to learners follow one rule.
const STAGES = lessonStages({ units, lessons, concepts });

/** The stage of a lesson: 0 when it needs nothing first, else one more than its latest prerequisite. */
export const stageOf = (id: string) => {
  const stage = STAGES.get(id);
  if (stage === undefined) throw new Error(`Unknown lesson ${id}`);
  return stage;
};

/** The lesson number shown to learners: l05 is lesson 5. */
export const lessonNumber = (id: string) => Number(id.slice(1));
