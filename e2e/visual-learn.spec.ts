// Visual regression of /learn, screen by screen, for a new learner in English: the first question of lesson 1 with
// its explanation closed, the feedback after a wrong answer, the explanation opened, and the summary of the lesson.
// Lessons run in a fixed order; mock exams are random, so they are left to learn.spec.ts. See visual.spec.ts for how
// the reference is taken.
import type { Page } from "@playwright/test";
import { test, expect, TEXTS, LEARNER_CODE, rightLetter, wrongLetter } from "./fixtures";

const s = TEXTS.en.learn;

async function shot(page: Page, name: string) {
  // No hover or pointer state in the picture; a new learner's code is replaced by one of the same shape.
  await page.mouse.move(0, 0);
  const code = page.getByText(LEARNER_CODE);
  if (await code.count()) await code.evaluate((el) => (el.textContent = "BRUECKE-7K2M"));
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot(name, { fullPage: true });
}

test("/learn overview with every lesson that can be started now", async ({ page }) => {
  await page.goto("/learn/");
  await page.getByText(s.openLessons).click();
  await expect(page.locator("details[open]")).toBeVisible();
  await shot(page, "learn-open-lessons.png");
});

test("/learn screens of a lesson", async ({ page }) => {
  test.slow();
  await page.goto("/learn/");
  await page.getByRole("button", { name: s.recommended }).click();
  const right = await rightLetter(page);
  await shot(page, "learn-question.png");

  await page.keyboard.press(wrongLetter(right));
  await expect(page.getByText(`${s.wrong} ${right.toUpperCase()}`)).toBeVisible();
  await shot(page, "learn-wrong.png");

  await page.getByText(s.showExplanation).click();
  await expect(page.locator("details")).toHaveAttribute("open", "");
  await shot(page, "learn-explanation.png");

  await page.getByRole("button", { name: s.next, exact: true }).click();
  for (let i = 0; i < 30; i++) {
    if ((await page.getByRole("heading", { level: 1 }).textContent()) === s.doneLesson) break;
    await page.locator(`[data-choices] [data-letter="${await rightLetter(page)}"]`).click();
    await page.getByRole("button", { name: s.next, exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 1, name: s.doneLesson })).toBeVisible();
  await shot(page, "learn-summary.png");
});
