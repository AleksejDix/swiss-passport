// Progress store for the online server: SQLite (built into Node), one row per learner code.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Progress } from "./engine/index.js";
import type { Store } from "./store.js";

export function sqliteStore(file = process.env.DB_FILE || join(homedir(), ".swiss-passport-quiz", "learners.db")): Store {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`CREATE TABLE IF NOT EXISTS learners (
    code TEXT PRIMARY KEY,
    progress TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);
  const get = db.prepare("SELECT progress FROM learners WHERE code = ?");
  const put = db.prepare(
    "INSERT INTO learners (code, progress, updated_at) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET progress = excluded.progress, updated_at = excluded.updated_at",
  );
  return {
    async load(code) {
      const row = get.get(code) as { progress: string } | undefined;
      return row ? (JSON.parse(row.progress) as Progress) : undefined;
    },
    async save(code, p) {
      put.run(code, JSON.stringify(p), new Date().toISOString());
    },
  };
}
