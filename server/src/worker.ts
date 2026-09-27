// Cloudflare Worker. The website is static assets; only /mcp runs here: stateless MCP over HTTP, progress in D1.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import card from "../data/card.html";
import type { Assets } from "./assets.js";
import { d1Store, deleteInactive, type D1Database } from "./d1-store.js";
import { createServer } from "./server.js";

interface Env {
  DB: D1Database;
  ASSETS: { fetch(request: Request | string): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Other paths only get here when no static file matches: let the assets answer (404).
    if (new URL(request.url).pathname !== "/mcp") return env.ASSETS.fetch(request);
    const assets: Assets = {
      async image(path) {
        const res = await env.ASSETS.fetch(new URL(`/${path}`, request.url).href);
        return Buffer.from(await res.arrayBuffer()).toString("base64");
      },
      card: async () => card,
    };
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await createServer(d1Store(env.DB), { online: true, assets }).connect(transport);
    return transport.handleRequest(request);
  },

  async scheduled(_controller: unknown, env: Env) {
    await deleteInactive(env.DB);
  },
};
