// The static pages: the language picker, the masthead, question pages and the 404 page.
import { test, expect, TEXTS, LANGUAGES, LANGUAGE_NAMES, questionNumber, questionId } from "./fixtures";
import type { Page } from "@playwright/test";
import quiz from "../quiz.json" with { type: "json" };

/** The question pages linked from the page, in order. */
const questionLinks = (page: Page) =>
  page.locator("main a").evaluateAll((as) => as.map((a) => a.getAttribute("href")!).filter((h) => /\/questions\/\d+-/.test(h)));

test.describe("language picker at /", () => {
  test("lists every language with its headline", async ({ page }) => {
    await page.goto("/");
    const picker = page.getByRole("navigation", { name: "Language / Sprache" });
    await expect(picker.getByRole("link")).toHaveCount(LANGUAGES.length);
    for (const lang of LANGUAGES) {
      const link = picker.getByRole("link", { name: new RegExp(`^${LANGUAGE_NAMES[lang]}`) });
      await expect(link).toHaveAttribute("href", `/${lang}/`);
      await expect(link).toContainText(TEXTS[lang].site.home.h1);
    }
  });

  test("remembers the chosen language and opens it next time", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(`^${LANGUAGE_NAMES.fr}`) }).click();
    await expect(page).toHaveURL("/fr/");
    await page.goto("/");
    await expect(page).toHaveURL("/fr/");
  });
});

test.describe("masthead", () => {
  test("every page in the main menu opens with a heading", async ({ page }) => {
    await page.goto("/en/");
    const links = page.getByRole("navigation", { name: TEXTS.en.site.ui.nav_main }).getByRole("link");
    const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toHaveLength(6);
    for (const href of hrefs) {
      const res = await page.goto(href!);
      expect(res?.status(), href!).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("the language menu opens the same page in another language", async ({ page }) => {
    await page.goto("/de/method/");
    await page.getByRole("navigation", { name: TEXTS.de.site.ui.nav_langs }).getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL("/en/method/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("the logo leads home", async ({ page }) => {
    await page.goto("/it/method/");
    await page.getByRole("link", { name: "Swiss Passport", exact: true }).click();
    await expect(page).toHaveURL("/it/");
  });
});

test.describe("question pages", () => {
  test("show the question, the right answer, the German original and the way on", async ({ page }) => {
    await page.goto("/en/questions/");
    await page.goto((await questionLinks(page))[0]);
    const n = questionNumber(page.url());
    const q = quiz.questions.find((x) => x.id === questionId(n))!;
    const en = TEXTS.en.questions[q.id];

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.question);
    await expect(page.locator('main [lang="de"]').first()).toHaveText(TEXTS.de.questions[q.id].question);
    await expect(page.getByRole("heading", { level: 2, name: `${TEXTS.en.site.ui.answer}: ${q.answer.toUpperCase()}` })).toBeVisible();
    await expect(page.getByText(en.why)).toBeVisible();

    // The first question of the curriculum has no previous one.
    await expect(page.getByRole("link", { name: TEXTS.en.site.ui.prev })).toHaveCount(0);
    await page.getByRole("link", { name: TEXTS.en.site.ui.next }).click();
    expect(questionNumber(page.url())).not.toBe(n);
    await expect(page.getByRole("link", { name: TEXTS.en.site.ui.prev })).toBeVisible();
  });

  test("breadcrumbs lead back to all questions", async ({ page }) => {
    await page.goto("/de/questions/");
    await page.goto((await questionLinks(page))[10]);
    const crumbs = page.getByRole("navigation", { name: TEXTS.de.site.ui.breadcrumb });
    await crumbs.getByRole("link", { name: TEXTS.de.site.ui.nav_questions }).click();
    await expect(page).toHaveURL("/de/questions/");
  });

  test("questions with pictures show all four pictures", async ({ page }) => {
    await page.goto("/de/questions/");
    await page.getByRole("link", { name: TEXTS.de.questions.q055.question }).click();
    const pictures = page.locator("main img");
    await expect(pictures).toHaveCount(4);
    for (const img of await pictures.all()) {
      await img.scrollIntoViewIfNeeded();
      expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });
});

test.describe("404", () => {
  test.use({ allowConsoleErrors: [/404/] });

  test("an unknown address answers 404 with a way home", async ({ page }) => {
    const res = await page.goto("/de/does-not-exist/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(TEXTS.de.site.not_found)).toBeVisible();
  });
});
