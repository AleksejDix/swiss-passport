// One learner's progress: what the engine reads and changes. Where it is stored is up to the caller.
import type { Answer } from "./catalog.js";

export interface ConceptState {
  level: number; // 0 = needs practice, then one level per review delay of the course
  due: string; // ISO timestamp of the next review
  done?: boolean; // passed the last review of a course that finishes topics: never due again
}
/** The activity in progress: its questions are handed out one at a time. */
export interface Session {
  kind: "lesson" | "review" | "exam";
  lesson?: string;
  questions: string[];
  pos: number;
  answers: Record<string, Answer>;
  voice?: boolean; // voice conversation: no picture questions
}
export interface Progress {
  language?: string;
  session?: Session;
  concepts: Record<string, ConceptState>;
  answered: Record<string, { correct: boolean; at: string }>;
  exams: { at: string; score: number; total: number; points?: number; max_points?: number }[];
}

export const emptyProgress = (): Progress => ({ concepts: {}, answered: {}, exams: [] });
