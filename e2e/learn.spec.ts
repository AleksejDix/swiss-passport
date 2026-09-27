// /learn: the browser client of the REST API /api/v1, against the real Worker and a local D1 database.
// Every test starts as a new learner (new browser context, new learner code).
import type { Page } from "@playwright/test";
import { test, expect, TEXTS, LEARNER_CODE, rightLetter, wrongLetter } from "./fixtures";

const s = TEXTS.en.learn;
const learnerCode = (page: Page) => page.getByText(LEARNER_CODE);

test("a new learner gets a code that survives a reload", async ({ page }) => {
  await page.goto("/learn/");
  await expect(page.getByRole("heading", { level: 1, name: s.title })).toBeVisible();
  const code = await learnerCode(page).textContent();
  await page.reload();
  await expect(learnerCode(page)).toHaveText(code!);
});

test("a whole lesson: wrong answers come back, right ones count, the summary ends it", async ({ page }) => {
  await page.goto("/learn/");
  await page.getByRole("button", { name: s.recommended }).click();

  // The first question wrong, by keyboard: the verdict names the right answer, Enter goes on.
  const first = await page.getByRole("heading", { level: 1 }).textContent();
  const right = await rightLetter(page);
  await page.keyboard.press(wrongLetter(right));
  await expect(page.getByText(`${s.wrong} ${right.toUpperCase()}`)).toBeVisible();
  await expect(page.getByText(s.comesAgain)).toBeVisible();
  await expect(page.getByRole("button", { name: s.next, exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(first!);

  // All the others right, with the mouse, until the summary.
  for (let i = 0; i < 30; i++) {
    const h1 = page.getByRole("heading", { level: 1 });
    if ((await h1.textContent()) === s.doneLesson) break;
    const letter = await rightLetter(page);
    await page.locator(`[data-choices] [data-letter="${letter}"]`).click();
    await expect(page.getByText(s.right, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: s.next, exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 1, name: s.doneLesson })).toBeVisible();
  await expect(page.getByText(s.firstTry)).toBeVisible();

  // The overview now counts one lesson.
  await page.getByRole("button", { name: s.overview }).click();
  await expect(page.getByText(s.lessonsDone)).toBeVisible();
  await expect(page.getByRole("cell", { name: /^1\/\d+$/ })).toBeVisible();
});

test("a new topic comes with its explanation, closed until the learner opens it", async ({ page }) => {
  await page.goto("/learn/");
  await page.getByRole("button", { name: s.recommended }).click();
  const explanation = page.locator("details");
  await expect(explanation).not.toHaveAttribute("open");
  await page.getByText(s.showExplanation).click();
  await expect(explanation).toHaveAttribute("open", "");
  await expect(explanation.getByRole("definition").first()).toBeVisible();
});

test("the language switches without a reload", async ({ page }) => {
  await page.goto("/learn/");
  await expect(page.getByRole("heading", { level: 1, name: s.title })).toBeVisible();
  await page.getByRole("navigation", { name: s.langs }).getByRole("button", { name: "Deutsch" }).click();
  await expect(page.getByRole("heading", { level: 1, name: TEXTS.de.learn.title })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("button", { name: "Deutsch" })).toHaveAttribute("aria-pressed", "true");
});

test.describe(() => {
  // The API answers an unknown code with 404, which the browser reports in the console.
  test.use({ allowConsoleErrors: [/status of 404/] });
  test("an unknown learner code is refused", async ({ page }) => {
    await page.goto("/learn/");
    await page.getByRole("textbox", { name: s.haveCode }).fill("NOBODY-AAAA");
    await page.getByRole("button", { name: s.useCode }).click();
    await expect(page.getByRole("alert")).toHaveText(s.unknownCode);
  });
});

test("a learner code continues on another device", async ({ page, browser }) => {
  await page.goto("/learn/");
  const code = (await learnerCode(page).textContent())!;
  const other = await (await browser.newContext({ locale: "en-GB" })).newPage();
  await other.goto("/learn/");
  await expect(learnerCode(other)).not.toHaveText(code);
  await other.getByRole("textbox", { name: s.haveCode }).fill(code);
  await other.getByRole("button", { name: s.useCode }).click();
  await expect(learnerCode(other)).toHaveText(code);
  await other.context().close();
});

test("a mock exam: 50 questions without feedback, then the result", async ({ page }) => {
  test.slow();
  await page.goto("/learn/");
  await page.getByRole("button", { name: s.exam }).click();
  for (let i = 1; i <= 50; i++) {
    await expect(page.getByText(`${i}/50`, { exact: true })).toBeVisible();
    await expect(page.getByText(s.right, { exact: true })).toHaveCount(0);
    await page.keyboard.press("a");
  }
  await expect(page.getByRole("heading", { level: 1, name: s.examResult })).toBeVisible();
  await expect(page.getByText(/^\d+\/50$/)).toBeVisible();
});
