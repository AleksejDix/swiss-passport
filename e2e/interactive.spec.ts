// The interactive figures of the static pages: they work with a mouse and with the keyboard.
import { test, expect, TEXTS } from "./fixtures";

test("home: the connector address is copied to the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/");
  const s = TEXTS.en.site.home;
  const button = page.getByRole("button", { name: s.copy });
  await button.click();
  await expect(page.getByRole("button", { name: s.copied })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://swiss-passport.com/mcp");
  await expect(button).toHaveText(s.copy, { timeout: 3000 });
});

test("home: the question map names the lesson under the pointer", async ({ page }) => {
  await page.goto("/en/");
  const lesson = page.locator("[data-qmap] a").first();
  await lesson.hover();
  await expect(page.locator("[data-readout]")).toHaveText((await lesson.getAttribute("aria-label"))!);
});

test.describe("method page", () => {
  test("the question to try explains a wrong answer and can be tried again", async ({ page }) => {
    await page.goto("/en/method/");
    const figure = page.locator("[data-try]");
    const { answer } = JSON.parse((await figure.getAttribute("data-question"))!);
    const wrong = ["a", "b", "c", "d"].find((l) => l !== answer)!;
    const s = TEXTS.en.site.home;

    await figure.locator(`[data-letter="${wrong}"]`).click();
    await expect(figure.getByText(s.hero_wrong)).toBeVisible();
    for (const b of await figure.locator("[data-letter]").all()) await expect(b).toBeDisabled();

    await figure.getByRole("button", { name: s.hero_again }).click();
    await figure.locator(`[data-letter="${answer}"]`).click();
    await expect(figure.getByText(s.hero_right)).toBeVisible();
  });

  test("the language switch shows the question in another language, the German stays", async ({ page }) => {
    await page.goto("/en/method/");
    const figure = page.locator("[data-langswitch]");
    const texts = JSON.parse((await figure.getAttribute("data-texts"))!);
    await figure.locator('[data-lang-choice="fr"]').click();
    await expect(figure.locator("[data-q]")).toHaveText(texts.fr.q);
    await expect(figure.locator("[data-q-de]")).toBeVisible();
    await expect(figure.locator('[data-lang-choice="fr"]')).toHaveAttribute("aria-pressed", "true");
    await figure.locator('[data-lang-choice="de"]').click();
    await expect(figure.locator("[data-q-de]")).toBeHidden();
  });

  test("mixed practice reorders the questions", async ({ page }) => {
    await page.goto("/en/method/");
    const figure = page.locator("[data-mix]");
    const order = () => figure.locator("[data-row] > *").evaluateAll((els) => els.map((e) => e.textContent));
    const blocked = await order();
    await figure.locator('[data-order="mixed"]').click();
    await expect.poll(order).not.toEqual(blocked);
    await figure.locator('[data-order="blocked"]').click();
    await expect.poll(order).toEqual(blocked);
  });

  test("the forgetting curve reads out a day with the keyboard", async ({ page }) => {
    await page.goto("/en/method/");
    const plot = page.locator("[data-curve] [data-plot]");
    await plot.focus();
    await page.keyboard.press("ArrowRight");
    const { day } = JSON.parse((await page.locator("[data-curve]").getAttribute("data-labels"))!);
    await expect(page.locator("[data-curve] [data-tip]")).toContainText(`${day} 1`);
    await page.keyboard.press("Home");
    await expect(page.locator("[data-curve] [data-tip]")).toContainText(`${day} 0`);
  });
});

test.describe("test guide: do I have to take the test?", () => {
  const c = TEXTS.en.site.viz.check;

  test("four times no: the test is needed", async ({ page }) => {
    await page.goto("/en/grundkenntnistest/");
    const check = page.locator("[data-check]");
    for (let i = 0; i < c.qs.length; i++)
      await check.getByRole("button", { name: c.no, exact: true }).locator("visible=true").click();
    await expect(check.getByText(c.resultYes)).toBeVisible();
    await expect(check.getByRole("button", { name: c.again })).toBeFocused();
  });

  test("one yes: no test, and it can start again", async ({ page }) => {
    await page.goto("/en/grundkenntnistest/");
    const check = page.locator("[data-check]");
    await check.getByRole("button", { name: c.yes, exact: true }).locator("visible=true").first().click();
    await expect(check.getByText(c.resultNo)).toBeVisible();
    await check.getByRole("button", { name: c.again }).click();
    await expect(check.getByText(c.resultNo)).toBeHidden();
  });
});
