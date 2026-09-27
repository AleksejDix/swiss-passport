// Slide decks from ../slides (one folder per talk), published as they are under /slides/<talk>/ after the build.
// Each deck also works on its own, offline; the Markdown notes next to it (README, demo runbook) stay out.
// Their headers (a Content-Security-Policy for the speaker view) are in security-headers.mjs.
import { cp } from "node:fs/promises";

export default function slides() {
  return {
    name: "slides",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        await cp(new URL("../slides/", import.meta.url), new URL("slides/", dir), {
          recursive: true,
          filter: (source) => !/\.md$|\.DS_Store$/.test(source),
        });
        logger.info("slide decks copied to /slides/");
      },
    },
  };
}
