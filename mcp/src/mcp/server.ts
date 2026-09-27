// The MCP server: tools, tutoring instructions and the quiz card. Used locally (stdio) and online (HTTP).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Assets } from "../assets.js";
import type { Guard } from "../guard.js";
import { createLearning } from "../learning/learning.js";
import type { Store } from "../store/store.js";
import { APP } from "./app.js";
import { registerCard } from "./card.js";
import { createRunner } from "./result.js";
import { instructions } from "./texts.js";
import { registerTools } from "./tools.js";

/**
 * Creates the server. `online` adds the learner code: without login, progress is stored per code, and a first step
 * without a code makes a new learner. Locally there is one learner and progress lives in a file.
 * `guard` and `client` (the caller's IP address): limits on wrong learner codes, as in the REST API. Missing locally.
 */
export function createServer(
  store: Store,
  { online, assets, guard, client = "local" }: { online: boolean; assets: Assets; guard?: Guard; client?: string },
) {
  const server = new McpServer(APP, { instructions: instructions(online) });
  registerCard(server, assets);
  // Finding the learner, loading and saving progress and what each tool does: learning/, shared with the REST API.
  const learning = createLearning(store, { learners: online ? "by-code-or-new" : "local" });
  registerTools(server, { online, learning, run: createRunner({ online, assets, guard, client }) });
  return server;
}
