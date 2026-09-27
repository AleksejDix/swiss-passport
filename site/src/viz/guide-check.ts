// Test guide visuals (issue #10). The four questions follow the canton's self-check on zh.ch (see sources/),
// in the same wording as the exemption list in guide.js. The order of test and application depends on the
// municipality (zh.ch); the City of Zurich tests only after the application (stadt-zuerich.ch).
import { byLang } from "../../../i18n/index.js";

export const CHECK_TEXT = byLang((t) => t.site.viz.check);

export const ORDER_TEXT = byLang((t) => t.site.viz.order);
