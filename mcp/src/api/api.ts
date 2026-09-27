// REST API for the website (/learn) and the mobile apps: the learning actions of the MCP tools (learning/) as
// plain JSON. Versioned under /api/v1/, so app versions in the stores keep working when the API changes later.
// Reference with examples: mcp/API.md. The endpoints are in endpoints.ts, JSON in and out in json.ts.
//
// The learner code travels in the JSON body, never in the URL or a header: Cloudflare's Workers Logs keep the URL
// and every request header for 3 days, and the privacy policy says the logs hold no learner code.
// Hardening: JSON only (415), bodies up to 8 KB (413), every field checked (400), wrong learner codes and new
// learners limited per client (429), no caching, headers that stop browsers from sniffing or framing the JSON.
import type { Guard } from "../guard.js";
import { createLearning } from "../learning/learning.js";
import type { Store } from "../store/store.js";
import { ENDPOINTS, type Context } from "./endpoints.js";
import { error } from "./json.js";

export const API_PREFIX = "/api/v1";

export const isApiPath = (pathname: string) => pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);

/** The endpoint's path after /api/v1, without a trailing slash, or undefined outside the API. */
const endpointPath = (pathname: string) =>
  pathname.startsWith(API_PREFIX) ? pathname.slice(API_PREFIX.length).replace(/\/$/, "") : undefined;

/** Answers a request under /api/v1/ for a client (IP address). New learner codes only come from POST /learners. */
export async function handleApi(
  request: Request,
  { store, guard, client }: { store: Store; guard?: Guard; client: string },
): Promise<Response> {
  try {
    return await route(request, { learning: createLearning(store, { learners: "by-code" }), guard, client });
  } catch (e) {
    // Only the message: never the request, which may carry a learner code.
    console.error("API error:", e instanceof Error ? e.message : String(e));
    return error("Something went wrong. Try again.", 500);
  }
}

async function route(request: Request, context: Context) {
  const path = endpointPath(new URL(request.url).pathname);
  const endpoint = path === undefined ? undefined : ENDPOINTS.get(path);
  if (!endpoint) return error("Not found.", 404);
  if (request.method !== endpoint.method) return error("Method not allowed.", 405, { allow: endpoint.method });
  return endpoint.handle(request, context);
}
