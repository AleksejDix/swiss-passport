// Progress store for the Vercel deployment: Upstash Redis over REST, one key per learner code.
import { Redis } from "@upstash/redis";
import type { Progress, Store } from "./progress.js";

export function upstashStore(): Store {
  // Reads KV_REST_API_URL / KV_REST_API_TOKEN (set by the Vercel Marketplace) or UPSTASH_REDIS_REST_URL / _TOKEN.
  const redis = Redis.fromEnv();
  const key = (code: string) => `learner:${code}`;
  return {
    async load(code) {
      return (await redis.get<Progress>(key(code))) ?? undefined;
    },
    async save(code, p) {
      await redis.set(key(code), p);
    },
  };
}
