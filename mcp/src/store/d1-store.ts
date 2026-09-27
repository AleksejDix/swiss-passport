// Progress store for the Cloudflare Worker: D1, Cloudflare's SQLite.
import { sqlStore, type Sql } from "./sql-store.js";

/** The part of Cloudflare's D1 binding used here. */
export interface D1Database {
  prepare(sql: string): { bind(...values: unknown[]): { first<T>(): Promise<T | null>; run(): Promise<unknown> } };
}

/** The D1 database behind the store. */
export const d1Sql = (db: D1Database): Sql => ({
  first: async (query, ...values) =>
    (await db
      .prepare(query)
      .bind(...values)
      .first()) ?? undefined,
  run: async (query, ...values) =>
    void (await db
      .prepare(query)
      .bind(...values)
      .run()),
});

export const d1Store = (db: D1Database) => sqlStore(d1Sql(db));
