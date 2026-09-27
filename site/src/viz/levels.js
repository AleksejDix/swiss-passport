// The three levels of the state (issue #6). Numbers from the explanation of three_levels: 1 Confederation,
// 26 cantons (20 + 6 former half-cantons), about 2200 municipalities in 2021. Names are key terms.
import { byLang } from "../../../i18n/index.js";

export const LEVELS_TEXT = byLang((t) => t.site.viz.levels);
export const MUNICIPALITIES = { count: 2200, year: 2021, cols: 100, rows: 22 }; // 100 × 22 = 2200
