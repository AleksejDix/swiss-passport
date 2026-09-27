// "How it works" chat on the homepage (issue #9): the few words that are not taken from the quiz data.
import { byLang } from "../../../i18n/index.js";

export const CHAT_TEXT = byLang((t) => t.site.viz.chat);
// The lesson step it plays: the principle of collegiality, then the exam question about it.
export const CHAT_TOPIC = "federal_council";
export const CHAT_QUESTION = "q005";
