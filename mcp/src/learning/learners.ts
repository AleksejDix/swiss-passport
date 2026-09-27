// Who is learning: the one learner on this computer, the learner of a learner code, or a new learner with a new code.
import { emptyProgress, type Progress } from "@aleksejdix/learning-engine";
import type { Store } from "../store/store.js";
import { newLearnerCode, normalizeCode } from "./codes.js";
import { errorOut, type Out } from "./steps.js";

/**
 * How learners are told apart. "local": one learner (Claude Desktop). "by-code": a learner code in every request,
 * new codes only on request (REST API). "by-code-or-new": a request without a code makes a new learner (MCP online).
 */
export type Learners = "local" | "by-code" | "by-code-or-new";

/** A learner's progress under its id (the learner code, or "local"), or why there is none. */
export type Found = { id: string; progress: Progress; created: boolean } | { error: Out };

const LOCAL = "local";

/** Finds learners in the store. `create`: a request without a code makes a new learner. */
export function learnerFinder(store: Store, learners: Learners) {
  async function byCode(code: string): Promise<Found> {
    const id = normalizeCode(code);
    const progress = await store.load(id);
    if (progress) return { id, progress, created: false };
    return {
      error: errorOut(`Unknown learner code "${code}". Check it, or leave learner_code empty to start fresh.`, 404),
    };
  }

  /** A code no learner has yet. */
  async function unusedCode() {
    let code: string;
    do code = newLearnerCode();
    while (await store.load(code));
    return code;
  }

  return async function find(code: string | undefined, create: boolean): Promise<Found> {
    if (learners === "local")
      return { id: LOCAL, progress: (await store.load(LOCAL)) ?? emptyProgress(), created: false };
    if (code) return byCode(code);
    if (!create) return { error: errorOut("A learner code is needed.", 401) };
    return { id: await unusedCode(), progress: emptyProgress(), created: true };
  };
}
