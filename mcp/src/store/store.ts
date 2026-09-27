// Where learner progress is stored: a local file (file-store.ts, Claude Desktop), D1 (d1-store.ts, Cloudflare Worker)
// or SQLite (sqlite-store.ts, self-hosted server).
import type { Progress } from "@aleksejdix/learning-engine";

/** Loads and saves one learner's progress. `id` identifies the learner (ignored by the local file store). */
export interface Store {
  load(id: string): Promise<Progress | undefined>;
  save(id: string, p: Progress): Promise<void>;
}
