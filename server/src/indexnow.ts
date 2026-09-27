// IndexNow (Bing, Copilot, Yandex, Seznam, Naver, Yep): tells search engines which pages changed, so they
// fetch them within minutes instead of on their next crawl. Runs every 10 minutes (cron trigger), so it
// works however the site was deployed: it reads the sitemap from the static files and reports the pages
// that are new, have a newer <lastmod>, or are gone since the last run (the first run only notes them).
// The pages last seen are one JSON row in D1. The key is the content of /indexnow.txt (site/public),
// which IndexNow fetches to check that the report comes from this site.

import type { D1Database } from "./d1-store.js";

const SITE = "https://swiss-passport.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const PER_REQUEST = 10000; // IndexNow's limit

/** The parts of the Worker's bindings used here. */
export interface IndexNowEnv {
  DB: D1Database;
  ASSETS: { fetch(request: Request | string): Promise<Response> };
}

async function text(env: IndexNowEnv, path: string) {
  const res = await env.ASSETS.fetch(new Request(`${SITE}${path}`));
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.text();
}

/** Every page of the sitemap with its <lastmod> ("" when it has none). */
export async function sitemapPages(env: IndexNowEnv): Promise<Map<string, string>> {
  const index = await text(env, "/sitemap-index.xml");
  const pages = new Map<string, string>();
  for (const [, loc] of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const xml = await text(env, new URL(loc).pathname);
    for (const [, url, lastmod] of xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)) pages.set(url, lastmod ?? "");
  }
  return pages;
}

/** The pages to report: new, changed or gone since `before`. */
export function changes(before: Record<string, string>, now: Map<string, string>): string[] {
  const changed = [...now].filter(([url, lastmod]) => before[url] !== lastmod).map(([url]) => url);
  const gone = Object.keys(before).filter((url) => !now.has(url));
  return [...changed, ...gone];
}

async function save(env: IndexNowEnv, pages: Map<string, string>) {
  await env.DB.prepare("INSERT INTO indexnow (id, pages) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET pages = excluded.pages")
    .bind(JSON.stringify(Object.fromEntries(pages)))
    .run();
}

export async function reportChanges(env: IndexNowEnv, send: typeof fetch = fetch): Promise<number> {
  const now = await sitemapPages(env);
  const row = await env.DB.prepare("SELECT pages FROM indexnow WHERE id = 1").bind().first<{ pages: string }>();
  // The first run only notes the pages: search engines know them from the sitemap, and IndexNow
  // refuses thousands of addresses at once from a new key (429).
  if (!row) {
    await save(env, now);
    return 0;
  }
  const urls = changes(JSON.parse(row.pages), now);
  if (urls.length === 0) return 0;

  const key = (await text(env, "/indexnow.txt")).trim();
  for (let i = 0; i < urls.length; i += PER_REQUEST) {
    const res = await send(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/indexnow.txt`, urlList: urls.slice(i, i + PER_REQUEST) }),
    });
    // 200: received, 202: received, key still being checked. Anything else: try again on the next run.
    if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow: ${res.status} ${await res.text()}`);
  }
  await save(env, now);
  return urls.length;
}
