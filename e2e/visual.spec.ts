// Visual regression: full-page screenshots of a sample of pages at phone, tablet and desktop width, compared pixel by
// pixel with a reference. The reference lives in e2e/__screenshots__/ and is not committed: fonts render differently
// on each system, and hundreds of full-page images would bloat the history. Before changing how pages look or are
// built, take the reference on the unchanged code:
//   npm run test:visual:update   (on main, before the change)
//   npm run test:visual          (after the change: every difference fails, with a diff image in the report)
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import curriculum from "../curriculum.json" with { type: "json" };

// Question pages are named after the German question: "/de/questions/55" is looked up in the list of questions.
const question = (lang: string, n: number) => `/${lang}/questions/${n}`;
async function resolve(page: Page, path: string) {
  const [, lang, n] = path.match(/^\/(\w+)\/questions\/(\d+)$/) ?? [];
  if (!n) return path;
  await page.goto(`/${lang}/questions/`);
  return (await page.locator(`main a[href^="/${lang}/questions/${n}-"]`).getAttribute("href"))!;
}

const PAGES = [
  "/",
  "/impressum/",
  "/datenschutz/",
  "/privacy/",
  "/support/",
  "/terms/",
  "/learn/",
  ...["de", "en", "ru"].flatMap((l) =>
    ["", "questions/", "grundkenntnistest/", "method/", "about/", "connect/", "curriculum/"].map((p) => `/${l}/${p}`),
  ),
  // Every topic in German: the figures (parliament, maps, timeline, ...) sit on these pages.
  ...curriculum.concepts.map((c) => `/de/topics/${c.id.replace(/_/g, "-")}/`),
  ...["parliament-chambers", "double-majority", "federal-council", "zh-location", "founding-1848"].flatMap((t) => [
    `/en/topics/${t}/`,
    `/ru/topics/${t}/`,
  ]),
  // Questions: the first ones, with pictures (55, 110, 229, 279, 289) and with figures (20, 8, 139, 5, 56, 68, 213).
  ...[1, 2, 3, 55, 110, 229, 279, 289, 20, 8, 139, 5, 56, 68, 213].map((n) => question("de", n)),
  ...[1, 55, 229, 20].flatMap((n) => [question("en", n), question("ru", n)]),
];

for (const entry of PAGES) {
  test(entry, async ({ page }) => {
    const path = await resolve(page, entry);
    await page.goto(path);
    if (path === "/learn/") {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // A new learner gets a new code every time; the screenshot shows a fixed one of the same shape.
      await page.getByText(/^[A-Z]+-[A-Z0-9]{4}$/).evaluate((el) => (el.textContent = "BRUECKE-7K2M"));
    }
    await page.evaluate(() => document.fonts.ready);
    const name = `${path.replace(/^\/|\/$/g, "").replace(/\//g, "__") || "picker"}.png`;
    await expect(page).toHaveScreenshot(name, { fullPage: true });
  });
}
