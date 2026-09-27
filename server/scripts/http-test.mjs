// Online server check over real HTTP: learner codes, progress kept in SQLite across restarts.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const PORT = 8799;
const env = { ...process.env, PORT: String(PORT), DB_FILE: join(mkdtempSync(join(tmpdir(), "spz-http-")), "learners.db") };
const key = Object.fromEntries(JSON.parse(readFileSync(new URL("../data/quiz.json", import.meta.url), "utf8")).questions.map((q) => [q.id, q.answer]));
const assert = (ok, msg) => { if (!ok) { console.error("FAIL:", msg); stop(); process.exit(1); } console.log("ok:", msg); };

let proc;
const start = () => new Promise((resolve) => {
  proc = spawn("node", ["dist/http.js"], { env });
  proc.stdout.on("data", (d) => String(d).includes("MCP server on") && resolve());
});
const stop = () => proc?.kill();
const connect = async () => {
  const c = new Client({ name: "http-test", version: "0" });
  await c.connect(new StreamableHTTPClientTransport(new URL(`http://localhost:${PORT}/mcp`)));
  return c;
};
const call = async (c, name, args = {}) => JSON.parse((await c.callTool({ name, arguments: args })).content[0].text);

await start();
let c = await connect();
assert(c.getInstructions()?.includes("learner_code"), "online instructions mention the learner code");
assert((await c.listTools()).tools.every((t) => "learner_code" in t.inputSchema.properties), "all tools take learner_code");

let r = await call(c, "get_progress", { language: "en" });
const code = r.learner_code;
assert(/^[A-Z]+-[2-9A-Z]{4}$/.test(code) && r.new_learner_code, `new learner gets a code: ${code}`);

let step = await call(c, "start_lesson", { learner_code: code });
assert(step.learner_code === code && step.step === "1/9", "lesson started for this learner");
for (let i = 0; i < 3; i++) step = (await call(c, "answer", { learner_code: code.toLowerCase(), answer: key[step.question?.id ?? step.next.question.id] })).next ?? step;
await c.close();

stop();
await start(); // restart: progress must come from SQLite
c = await connect();
r = await call(c, "get_progress", { learner_code: code });
assert(r.unfinished_session?.step === "4/9" && r.readiness_percent === 0, "after restart: same learner continues at step 4/9");
r = await call(c, "answer", { learner_code: code, answer: key[step.question.id] });
assert(r.feedback?.correct === true, "answering continues where the learner left off");

r = await call(c, "get_progress", { learner_code: "NOPE-0000" });
assert(r.error?.includes("Unknown learner code"), "unknown code is rejected");
const other = await call(c, "get_progress", {});
assert(other.learner_code !== code && other.lessons_done === 0, "a second learner gets their own fresh progress");

const card = await c.readResource({ uri: "ui://swiss-passport/card-v4.html" });
assert(card.contents[0].mimeType === "text/html;profile=mcp-app", "quiz card available online");

const home = await fetch(`http://localhost:${PORT}/`);
assert(home.ok && (await home.text()).includes("/mcp"), "home page explains the connector URL");

await c.close();
stop();
console.log("all checks passed");
