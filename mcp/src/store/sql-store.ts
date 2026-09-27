// Progress in SQL, the same for D1 (Cloudflare) and SQLite (self-hosted): one row per learner code in the table
// learners (migrations/0001_learners.sql).
import type { Progress } from "@aleksejdix/learning-engine";
import type { Store } from "./store.js";

/** The two calls a store needs from a database: the first row of a query, and running a statement. */
export interface Sql {
  first<T>(query: string, ...values: unknown[]): Promise<T | undefined>;
  run(query: string, ...values: unknown[]): Promise<void>;
}

export const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS learners (
    code TEXT PRIMARY KEY,
    progress TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`;
const LOAD = "SELECT progress FROM learners WHERE code = ?";
const SAVE =
  "INSERT INTO learners (code, progress, updated_at) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET progress = excluded.progress, updated_at = excluded.updated_at";
const DELETE_BEFORE = "DELETE FROM learners WHERE updated_at < ?";

export function sqlStore(sql: Sql): Store {
  return {
    async load(code) {
      const row = await sql.first<{ progress: string }>(LOAD, code);
      return row ? (JSON.parse(row.progress) as Progress) : undefined;
    },
    async save(code, p) {
      await sql.run(SAVE, code, JSON.stringify(p), new Date().toISOString());
    },
  };
}

/** Deletes progress 12 months after the last activity (privacy policy). */
export async function deleteInactive(sql: Sql, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  await sql.run(DELETE_BEFORE, cutoff.toISOString());
}
