// Learner codes: they identify learners online without a login, e.g. "BERG-7K2Q".
import { randomInt } from "node:crypto";

const WORDS = ["BERG", "SEE", "ALP", "FLUSS", "WALD", "TAL", "STERN", "WOLKE", "BRUNNEN", "BRUECKE", "TURM", "INSEL"];
/** Unambiguous characters only: no 0, 1, I and O. */
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const FORMAT = /^[A-Z]{3,8}-[2-9A-HJ-NP-Z]{4}$/;

export function newLearnerCode(): string {
  const tail = Array.from({ length: 4 }, () => CHARS[randomInt(CHARS.length)]).join("");
  return `${WORDS[randomInt(WORDS.length)]}-${tail}`;
}

/** The code as stored: upper case, without spaces. */
export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

/** A normalized code that newLearnerCode could have made. */
export const isLearnerCode = (code: string) => FORMAT.test(code);
