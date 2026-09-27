// Progress store for the self-hosted server: SQLite, built into Node.
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { CREATE_TABLE, sqlStore } from "./sql-store.js";

export function sqliteStore(file = process.env.DB_FILE || join(homedir(), ".swiss-passport-quiz", "learners.db")) {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(CREATE_TABLE);
  return sqlStore({
    first: async <T>(query: string, ...values: unknown[]) =>
      db.prepare(query).get(...(values as SQLInputValue[])) as T | undefined,
    run: async (query, ...values) => void db.prepare(query).run(...(values as SQLInputValue[])),
  });
}
