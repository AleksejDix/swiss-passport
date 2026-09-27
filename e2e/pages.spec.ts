// Every page of the site, without a browser: it loads, has its head, and every link and picture on it works.
// Then one page of each kind in a real browser: no console errors, no Content-Security-Policy violations.
import { test, expect, LANGUAGES } from "./fixtures";

const SITE = "https://swiss-passport.com";
const locs = (xml: string) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

test("every page in the sitemap loads, with a title, a heading and working links", async ({ request }) => {
  test.setTimeout(10 * 60_000);
  const sitemaps = locs(await (await request.get("/sitemap-index.xml")).text());
  const pages = (await Promise.all(sitemaps.map(async (s) => locs(await (await request.get(s)).text())))).flat();
  expect(pages.length).toBeGreaterThan(LANGUAGES.length * 350);

  // Links, pictures, scripts and styles on the pages, and the canonical and language alternates in the head.
  const targets = new Map<string, string>();
  const problems: string[] = [];
  const queue = [...pages, "/learn/"];
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      for (let path = queue.shift(); path; path = queue.shift()) {
        const res = await request.get(path);
        const html = await res.text();
        if (res.status() !== 200) problems.push(`${path}: status ${res.status()}`);
        if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${path}: no <title>`);
        if (!/<h1[\s>]/.test(html) && path !== "/learn/") problems.push(`${path}: no <h1>`);
        if (!/<html lang="[a-z]+"/.test(html)) problems.push(`${path}: no <html lang>`);
        for (const [, url] of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
          const target = url.startsWith(SITE) ? url.slice(SITE.length) || "/" : url;
          if (target.startsWith("/") && !target.startsWith("//") && !targets.has(target)) targets.set(target, path);
        }
      }
    }),
  );

  const links = [...targets];
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      for (let link = links.shift(); link; link = links.shift()) {
        const [target, from] = link;
        if (target === "/mcp") continue; // the MCP endpoint answers POST, checked in learn.spec.ts
        const status = (await request.head(target)).status();
        if (status !== 200) problems.push(`${target} (linked from ${from}): status ${status}`);
      }
    }),
  );
  expect(problems).toEqual([]);
});

// Set in site/security-headers.mjs. HSTS and nosniff come from the Cloudflare dashboard, not from this repository.
test("pages carry the security headers", async ({ request }) => {
  for (const path of ["/", "/de/", "/learn/", "/de/method/"]) {
    const headers = (await request.get(path)).headers();
    expect(headers["content-security-policy"], path).toContain("script-src 'self'");
    expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"], path).toBe("DENY");
    expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"], path).toContain("camera=()");
  }
});

// One page of each kind, with every interactive figure, in German and in a Cyrillic language.
const KINDS = [
  "/",
  "/de/",
  "/ru/",
  "/de/questions/",
  "/de/grundkenntnistest/",
  "/de/method/",
  "/de/about/",
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
  "/datenschutz/",
  "/learn/",
];

for (const path of KINDS) {
  test(`${path} runs without console errors or CSP violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    // Scroll through the page, so figures that start when they come into view run too.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    await page.waitForLoadState("networkidle");
  });
}
