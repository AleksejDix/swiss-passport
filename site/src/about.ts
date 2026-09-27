// The about page: who is behind the site, where the content comes from, and how it is checked.
// Links: {repo} {issues} {license} {content_license} {sources} {guide} {pdf} {email} {aleksej} {lidia} {webzurich}
import { LINKS } from "./guide.ts";
import { OPERATOR } from "./legal.ts";
import { byLang } from "../../i18n/index.js";

// The makers, for the structured data of the about and method pages.
export const MAKERS = [
  {
    "@type": "Person",
    name: "Aleksej Dix",
    url: "https://www.linkedin.com/in/aleksejdix/",
    sameAs: ["https://github.com/AleksejDix"],
  },
  { "@type": "Person", name: "Lidia Dix", url: "https://www.linkedin.com/in/lidiadix/" },
];

export const ABOUT_LINKS = {
  pdf: LINKS.pdf,
  email: OPERATOR.email,
  aleksej: MAKERS[0].url,
  lidia: MAKERS[1].url,
  webzurich: "https://webzurich.ch",
  repo: "https://github.com/AleksejDix/swiss-passport",
  issues: "https://github.com/AleksejDix/swiss-passport/issues",
  license: "https://github.com/AleksejDix/swiss-passport/blob/main/LICENSE",
  content_license: "https://github.com/AleksejDix/swiss-passport/blob/main/LICENSE-CONTENT.md",
  sources: "https://github.com/AleksejDix/swiss-passport/blob/main/sources/README.md",
};

export const ABOUT = byLang((t) => t.site.about);
