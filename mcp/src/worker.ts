// Cloudflare Worker. The website is static assets; only /mcp (stateless MCP over HTTP) and /api/v1/ (REST API for
// the website and the apps) run here, both with the same learning actions and progress in D1.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import card from "../data/card.html";
import { handleApi, isApiPath } from "./api/api.js";
import type { Assets } from "./assets.js";
import { cloudflareGuard, type Guard, type RateLimit } from "./guard.js";
import { createServer } from "./mcp/server.js";
import { d1Sql, d1Store, type D1Database } from "./store/d1-store.js";
import { deleteInactive } from "./store/sql-store.js";

interface Env {
  DB: D1Database;
  ASSETS: { fetch(request: Request | string): Promise<Response> };
  // Rate limiting bindings (wrangler.jsonc). RATE_LIMITS "off" in local development (npm run dev:worker).
  NEW_LEARNERS: RateLimit;
  WRONG_CODES: RateLimit;
  RATE_LIMITS?: string;
}

/** Pictures and the quiz card: the pictures are the site's static files, the card is bundled. */
const workerAssets = (env: Env, base: string): Assets => ({
  async image(path) {
    const res = await env.ASSETS.fetch(new URL(`/${path}`, base).href);
    return Buffer.from(await res.arrayBuffer()).toString("base64");
  },
  card: async () => card,
});

/** Stateless MCP over HTTP: a fresh server per request; everything the learner needs is in D1. */
async function handleMcp(request: Request, env: Env, guard: Guard | undefined, client: string) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const assets = workerAssets(env, request.url);
  await createServer(d1Store(env.DB), { online: true, assets, guard, client }).connect(transport);
  return transport.handleRequest(request);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    // Limits per client IP for both the API and MCP (guard.ts).
    const guard = env.RATE_LIMITS === "off" ? undefined : cloudflareGuard(env.NEW_LEARNERS, env.WRONG_CODES);
    const client = request.headers.get("cf-connecting-ip") ?? "local";
    if (isApiPath(pathname)) return handleApi(request, { store: d1Store(env.DB), guard, client });
    if (pathname === "/mcp") return handleMcp(request, env, guard, client);
    // Other paths only get here when no static file matches: let the assets answer (404).
    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller: unknown, env: Env) {
    await deleteInactive(d1Sql(env.DB));
  },
};
