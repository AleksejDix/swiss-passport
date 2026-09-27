// Visual regression: full-page screenshots of a sample of pages at phone, tablet and desktop width, compared pixel by
// pixel with a reference. The reference lives in e2e/__screenshots__/ and is not committed: fonts render differently
// on each system, and hundreds of full-page images would bloat the history. Before changing how pages look or are
// built, take the reference on the unchanged code:
//   npm run test:visual:update   (on main, before the change)
//   npm run test:visual          (after the change: every difference fails, with a diff image in the report)
import { readdirSync } from "node:fs";
import { test, expect } from "./fixtures";

const built = new URL("../server/public/", import.meta.url);
const slug = (lang: string, n: number) =>
  `/${lang}/questions/${readdirSync(new URL(`${lang}/questions/`, built)).find((d) => d.startsWith(`${n}-`))}/`;

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
  ...readdirSync(new URL("de/topics/", built)).map((t) => `/de/topics/${t}/`),
  ...["parliament-chambers", "double-majority", "federal-council", "zh-location", "founding-1848"].flatMap((t) => [
    `/en/topics/${t}/`,
    `/ru/topics/${t}/`,
  ]),
  // Questions: the first ones, with pictures (55, 110, 229, 279, 289) and with figures (20, 8, 139, 5, 56, 68, 213).
  ...[1, 2, 3, 55, 110, 229, 279, 289, 20, 8, 139, 5, 56, 68, 213].map((n) => slug("de", n)),
  ...[1, 55, 229, 20].flatMap((n) => [slug("en", n), slug("ru", n)]),
];

for (const path of PAGES) {
  test(path, async ({ page }) => {
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
