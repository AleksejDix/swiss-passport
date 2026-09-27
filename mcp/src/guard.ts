// Limits per client (IP address) for the REST API on Cloudflare: Workers rate limiting bindings (wrangler.jsonc)
// plus a short block, kept in Cloudflare's cache of this location, for clients that guess learner codes.
// Only wrong codes count, not requests with a valid code: a class in a course shares one IP address.
import type { Guard } from "./api.js";

/** The part of Cloudflare's rate limiting binding used here. */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export const BLOCK_SECONDS = 600;
const blockKey = (ip: string) => new Request(`https://guard.invalid/wrong-codes/${encodeURIComponent(ip)}`);
const cache = () => (caches as unknown as { default: Cache }).default;

export function cloudflareGuard(newLearners: RateLimit, wrongCodes: RateLimit): Guard {
  return {
    newLearner: async (ip) => (await newLearners.limit({ key: ip })).success,
    blocked: async (ip) => Boolean(await cache().match(blockKey(ip))),
    async wrongCode(ip) {
      if ((await wrongCodes.limit({ key: ip })).success) return;
      // Too many wrong codes in a minute: every request with a code waits, so that a right guess stays hidden too.
      await cache().put(blockKey(ip), new Response("1", { headers: { "cache-control": `max-age=${BLOCK_SECONDS}` } }));
    },
  };
}
