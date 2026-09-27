// Shared test setup. Every test fails on a console error, an uncaught exception or a blocked resource, which is how
// a Content-Security-Policy violation shows up.
import { test as base, expect, type Page } from "@playwright/test";
import { TEXTS, LANGUAGES, LANGUAGE_NAMES } from "../i18n/index.js";
import quiz from "../quiz.json" with { type: "json" };

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

export const LETTERS = ["a", "b", "c", "d"] as const;
/** A learner code as /learn shows it: BERG-7K2Q. */
export const LEARNER_CODE = /^[A-Z]+-[A-Z0-9]{4}$/;

/** /learn: the right letter for the question on the screen, found by its English wording (and options, where texts repeat). */
export async function rightLetter(page: Page) {
  // The question arrives from the API after the click: wait for its four open options.
  await expect(page.locator("[data-choices] button:enabled")).toHaveCount(4);
  const question = await page.getByRole("heading", { level: 1 }).textContent();
  const options = await page
    .locator("[data-choices] button")
    .evaluateAll((bs) => bs.map((b) => b.querySelector("span")?.textContent ?? null));
  const matches = quiz.questions.filter((q) => {
    const t = TEXTS.en.questions[q.id];
    return t.question === question && (options[0] === null || LETTERS.every((l, i) => t.options[l] === options[i]));
  });
  expect(matches.length, `question "${question}" found once`).toBe(1);
  return matches[0].answer;
}
export const wrongLetter = (right: string) => LETTERS.find((l) => l !== right)!;
