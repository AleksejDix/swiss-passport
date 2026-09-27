// Shared test setup. Every test fails on a console error, an uncaught exception or a blocked resource, which is how
// a Content-Security-Policy violation shows up.
import { test as base, expect } from "@playwright/test";
import { TEXTS, LANGUAGES, LANGUAGE_NAMES } from "../i18n/index.js";

type Options = { allowConsoleErrors: RegExp[] };

export const test = base.extend<Options & { consoleErrors: string[] }>({
  allowConsoleErrors: [[], { option: true }],
  consoleErrors: [
    async ({ page, allowConsoleErrors }, use) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !allowConsoleErrors.some((re) => re.test(m.text()))) errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(e.message));
      await use(errors);
      expect(errors, "console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect, TEXTS, LANGUAGES, LANGUAGE_NAMES };

/** The official number of a question page, from its URL: /de/questions/55-welche-ist.../ is 55. */
export const questionNumber = (url: string) => Number(url.match(/\/questions\/(\d+)-/)?.[1]);
/** The id of question n in quiz.json and the language files: 55 is q055. */
export const questionId = (n: number) => `q${String(n).padStart(3, "0")}`;
