// Where learner progress is stored: a local file (Claude Desktop); the online stores are in d1-store and sqlite-store.
// Also the learner codes that identify learners online without a login.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomInt } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { emptyProgress, type Progress } from "@aleksejdix/learning-engine";

/** Loads and saves one learner's progress. `id` identifies the learner (ignored by the local file store). */
export interface Store {
  load(id: string): Promise<Progress | undefined>;
  save(id: string, p: Progress): Promise<void>;
}

/** Single learner on this computer. */
export function fileStore(file = process.env.PROGRESS_FILE || join(homedir(), ".swiss-passport-quiz", "progress.json")): Store {
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

/** Learner code without login, e.g. "BERG-7K2Q". Unambiguous characters only. */
const WORDS = ["BERG", "SEE", "ALP", "FLUSS", "WALD", "TAL", "STERN", "WOLKE", "BRUNNEN", "BRUECKE", "TURM", "INSEL"];
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function newLearnerCode(): string {
  const tail = Array.from({ length: 4 }, () => CHARS[randomInt(CHARS.length)]).join("");
  return `${WORDS[randomInt(WORDS.length)]}-${tail}`;
}
export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");
