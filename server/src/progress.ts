// Learner progress and where it is stored: a local file (Claude Desktop) or Redis (online connector).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomInt } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Lang } from "./content.js";

export interface ConceptState {
  level: number; // 0 = needs practice, 1..5 = spaced-repetition level
  due: string; // ISO timestamp of the next review
}
/** The activity in progress: its questions are handed out one at a time. */
export interface Session {
  kind: "lesson" | "review" | "exam";
  lesson?: string;
  questions: string[];
  pos: number;
  answers: Record<string, "a" | "b" | "c" | "d">;
  voice?: boolean; // voice conversation: no picture questions
}
export interface Progress {
  language?: Lang;
  session?: Session;
  concepts: Record<string, ConceptState>;
  answered: Record<string, { correct: boolean; at: string }>;
  exams: { at: string; score: number; total: number }[];
}

export const emptyProgress = (): Progress => ({ concepts: {}, answered: {}, exams: [] });

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
