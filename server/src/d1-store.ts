// Progress store for the Cloudflare Worker: D1 (SQLite), one row per learner code, same table as sqlite-store.ts.
import type { Progress, Store } from "./progress.js";

/** The part of Cloudflare's D1 binding used here. */
export interface D1Database {
  prepare(sql: string): { bind(...values: unknown[]): { first<T>(): Promise<T | null>; run(): Promise<unknown> } };
}

export function d1Store(db: D1Database): Store {
  return {
    async load(code) {
      const row = await db.prepare("SELECT progress FROM learners WHERE code = ?").bind(code).first<{ progress: string }>();
      return row ? (JSON.parse(row.progress) as Progress) : undefined;
    },
    async save(code, p) {
      await db
        .prepare(
          "INSERT INTO learners (code, progress, updated_at) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET progress = excluded.progress, updated_at = excluded.updated_at",
        )
        .bind(code, JSON.stringify(p), new Date().toISOString())
        .run();
    },
  };
}

/** Deletes progress 12 months after the last activity (privacy policy). Runs daily (cron trigger). */
export async function deleteInactive(db: D1Database, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  await db.prepare("DELETE FROM learners WHERE updated_at < ?").bind(cutoff.toISOString()).run();
}
