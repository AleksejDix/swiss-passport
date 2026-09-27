// Cloudflare Worker. The website is static assets; only /mcp (stateless MCP over HTTP) and /api/v1/ (REST API for
// the website and the apps) run here, both with the same learning actions and progress in D1.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import card from "../data/card.html";
import type { Assets } from "./assets.js";
import { API_PREFIX, handleApi } from "./api.js";
import { d1Store, deleteInactive, type D1Database } from "./d1-store.js";
import { cloudflareGuard, type RateLimit } from "./guard.js";
import { createLearning } from "./learning.js";
import { createServer } from "./server.js";

interface Env {
  DB: D1Database;
  ASSETS: { fetch(request: Request | string): Promise<Response> };
  // Rate limiting bindings (wrangler.jsonc). RATE_LIMITS "off" in local development (npm run dev:worker).
  NEW_LEARNERS: RateLimit;
  WRONG_CODES: RateLimit;
  RATE_LIMITS?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    // Limits per client IP for both the API and MCP (guard.ts).
    const guard = env.RATE_LIMITS === "off" ? undefined : cloudflareGuard(env.NEW_LEARNERS, env.WRONG_CODES);
    const client = request.headers.get("cf-connecting-ip") ?? "local";
    if (pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`))
      return handleApi(request, createLearning(d1Store(env.DB), { online: true }), guard);
    // Other paths only get here when no static file matches: let the assets answer (404).
    if (pathname !== "/mcp") return env.ASSETS.fetch(request);
    const assets: Assets = {
      async image(path) {
        const res = await env.ASSETS.fetch(new URL(`/${path}`, request.url).href);
        return Buffer.from(await res.arrayBuffer()).toString("base64");
      },
      card: async () => card,
    };
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await createServer(d1Store(env.DB), { online: true, assets, guard, client }).connect(transport);
    return transport.handleRequest(request);
  },

  async scheduled(_controller: unknown, env: Env) {
    await deleteInactive(env.DB);
  },
};
