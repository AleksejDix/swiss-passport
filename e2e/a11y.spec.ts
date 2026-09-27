// Accessibility: axe-core checks one page of each kind against WCAG 2.1 A and AA.
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const PAGES = [
  "/",
  "/de/",
  "/ru/",
  "/de/questions/",
  "/en/questions/55-welche-ist-die-schweizer-nationalfahne/",
  "/de/grundkenntnistest/",
  "/de/method/",
  "/de/about/",
  "/de/sponsors/",
  "/de/connect/",
  "/de/curriculum/",
  "/de/topics/parliament-chambers/",
  "/de/topics/federal-council/",
  "/de/topics/separation-of-powers/",
  "/de/topics/three-levels/",
  "/de/topics/three-pillars/",
  "/de/topics/double-majority/",
  "/de/topics/founding-1848/",
  "/de/topics/zh-location/",
  "/impressum/",
  "/learn/",
];

for (const path of PAGES) {
  test(`${path} meets WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(path);
    if (path === "/learn/") await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const found = violations.map(
      (v) => `${v.id} (${v.impact}): ${v.help}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    );
    expect(found).toEqual([]);
  });
}
