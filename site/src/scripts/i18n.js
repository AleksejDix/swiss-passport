// Homepage texts and the names of the languages, from the language files in i18n/ (site.home and name).
// Build time only: /learn gets its texts from the page (see learn.js).
import { LANGUAGE_NAMES, byLang } from "../../../i18n/index.js";

export const LANGS = LANGUAGE_NAMES;
export const STRINGS = byLang((t) => t.site.home);
