// Limits per client (IP address) for the REST API and the MCP endpoint: new learner codes per minute, and wrong
// learner codes, whose excess blocks every request with a code from that client for 10 minutes, so that a right
// guess stays hidden too. Requests with a valid code are not limited: a class in a course shares one IP address.
// On Cloudflare the counting uses Workers rate limiting bindings (wrangler.jsonc) and the block the cache of the
// location; the self-hosted server (http.ts) keeps both in memory.

export const BLOCK_SECONDS = 600;

/** Limits per client (IP address). Missing in local development and tests. */
export interface Guard {
  /** false: this client made too many new learners in the last minute. */
  newLearner(ip: string): Promise<boolean>;
  /** true: this client sent too many wrong learner codes and has to wait. */
  blocked(ip: string): Promise<boolean>;
  /** Counts a wrong learner code. */
  wrongCode(ip: string): Promise<void>;
}

/**
 * Runs a request that names a learner. Undefined while the client is blocked after too many wrong learner codes;
 * an unknown code (status 404) counts against the client. Without a guard (local, development) it just runs.
 */
export async function guarded<T extends { out: { status?: number } }>(
  guard: Guard | undefined,
  client: string,
  request: () => Promise<T>,
): Promise<T | undefined> {
  if (!guard) return request();
  if (await guard.blocked(client)) return undefined;
  const result = await request();
  if (result.out.status === 404) await guard.wrongCode(client);
  return result;
}

/** The part of Cloudflare's rate limiting binding used here. */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

const blockKey = (ip: string) => new Request(`https://guard.invalid/wrong-codes/${encodeURIComponent(ip)}`);
const cache = () => (caches as unknown as { default: Cache }).default;

export function cloudflareGuard(newLearners: RateLimit, wrongCodes: RateLimit): Guard {
  return {
    newLearner: async (ip) => (await newLearners.limit({ key: ip })).success,
    blocked: async (ip) => Boolean(await cache().match(blockKey(ip))),
    async wrongCode(ip) {
      if ((await wrongCodes.limit({ key: ip })).success) return;
      await cache().put(blockKey(ip), new Response("1", { headers: { "cache-control": `max-age=${BLOCK_SECONDS}` } }));
    },
  };
}

/** The same limits in memory, per process: for the self-hosted server (http.ts). */
export function memoryGuard({ newLearners = 30, wrongCodes = 20, now = () => Date.now() } = {}): Guard {
  const counts = new Map<string, { since: number; count: number }>();
  const blockedUntil = new Map<string, number>();
  /** Counts one event in the client's current minute; false once the minute's limit is passed. */
  const count = (key: string, limit: number) => {
    const t = now();
    if (counts.size > 10_000) for (const [k, c] of counts) if (t - c.since >= 60_000) counts.delete(k);
    const c = counts.get(key);
    if (!c || t - c.since >= 60_000) counts.set(key, { since: t, count: 1 });
    else c.count++;
    return counts.get(key)!.count <= limit;
  };
  return {
    newLearner: async (ip) => count(`new ${ip}`, newLearners),
    blocked: async (ip) => (blockedUntil.get(ip) ?? 0) > now(),
    async wrongCode(ip) {
      if (!count(`wrong ${ip}`, wrongCodes)) blockedUntil.set(ip, now() + BLOCK_SECONDS * 1000);
    },
  };
}
