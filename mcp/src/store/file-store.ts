// Progress of the single learner on this computer (Claude Desktop), in a JSON file.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { emptyProgress } from "@aleksejdix/learning-engine";
import type { Store } from "./store.js";

export function fileStore(
  file = process.env.PROGRESS_FILE || join(homedir(), ".swiss-passport-quiz", "progress.json"),
): Store {
  return {
    async load() {
      return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : emptyProgress();
    },
    async save(_id, p) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, JSON.stringify(p, null, 2));
    },
  };
}
