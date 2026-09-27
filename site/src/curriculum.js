// The curriculum page: units, lessons and which lesson builds on which (requires in curriculum.json).
// The texts come from the language files in i18n/ (site.curriculum).
import { byLang } from "../../i18n/index.js";
import { lessons } from "./data.js";

export const CURRICULUM = byLang((t) => t.site.curriculum);

const byId = new Map(lessons.map((l) => [l.id, l]));

/** The stage of a lesson: 0 when it needs nothing first, else one more than its latest prerequisite. */
export function stageOf(id) {
  const requires = byId.get(id).requires ?? [];
  return requires.length ? 1 + Math.max(...requires.map(stageOf)) : 0;
}

/** The lesson number shown to learners: l05 is lesson 5. */
export const lessonNumber = (id) => Number(id.slice(1));
