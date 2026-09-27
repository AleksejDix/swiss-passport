// Online server check over real HTTP: learner codes, progress kept in SQLite across restarts.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const PORT = 8799;
const env = {
  ...process.env,
  PORT: String(PORT),
  DB_FILE: join(mkdtempSync(join(tmpdir(), "spz-http-")), "learners.db"),
};
const key = Object.fromEntries(
  JSON.parse(readFileSync(new URL("../data/quiz.json", import.meta.url), "utf8")).questions.map((q) => [
    q.id,
    q.answer,
  ]),
);
const assert = (ok, msg) => {
  if (!ok) {
    console.error("FAIL:", msg);
    stop();
    process.exit(1);
  }
  console.log("ok:", msg);
};

let proc;
const start = () =>
  new Promise((resolve) => {
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
assert(
  (await c.listTools()).tools.every((t) => "learner_code" in t.inputSchema.properties),
  "all tools take learner_code",
);

const progressTool = (await c.listTools()).tools.find((t) => t.name === "get_progress");
assert(progressTool.annotations?.readOnlyHint === true, "get_progress is declared read-only online too");
let r = await call(c, "get_progress", { language: "en" });
assert(
  !r.learner_code && r.no_learner_code_yet && r.lessons_done === 0,
  "get_progress creates no code for a new learner",
);

const first = await call(c, "start_lesson", { language: "en" });
const code = first.learner_code;
assert(
  /^[A-Z]+-[2-9A-Z]{4}$/.test(code) && first.new_learner_code,
  `the first start_lesson creates the learner code: ${code}`,
);
assert(first.lesson_choices?.length > 1 && !first.question, "a new learner gets the lessons to choose from");
let step = await call(c, "start_lesson", { learner_code: code, lesson_id: "l01" });
assert(step.step === "1/9" && !step.new_learner_code, "the chosen lesson starts for this learner");
for (let i = 0; i < 3; i++)
  step =
    (
      await call(c, "answer", {
        learner_code: code.toLowerCase(),
        answer: key[step.question?.id ?? step.next.question.id],
      })
    ).next ?? step;
await c.close();

stop();
await start(); // restart: progress must come from SQLite
c = await connect();
r = await call(c, "get_progress", { learner_code: code });
assert(
  r.unfinished_session?.step === "4/9" && r.readiness_percent === 0,
  "after restart: same learner continues at step 4/9",
);
r = await call(c, "answer", { learner_code: code, answer: key[step.question.id] });
assert(r.feedback?.correct === true, "answering continues where the learner left off");

r = await call(c, "get_progress", { learner_code: "NOPE-0000" });
assert(r.error?.includes("Unknown learner code"), "unknown code is rejected");
const other = await call(c, "start_lesson", {});
assert(
  other.learner_code && other.learner_code !== code && other.lesson_choices,
  "a second learner gets their own code",
);
const before = await call(c, "get_progress", { learner_code: code });
await call(c, "get_progress", { learner_code: code, language: "de" });
const after = await call(c, "get_progress", { learner_code: code });
assert(JSON.stringify(after) === JSON.stringify(before), "get_progress changes nothing, not even the language");

const card = await c.readResource({ uri: "ui://swiss-passport/card-v8.html" });
assert(card.contents[0].mimeType === "text/html;profile=mcp-app", "quiz card available online");

const home = await fetch(`http://localhost:${PORT}/`);
assert(home.ok && (await home.text()).includes("/mcp"), "home page explains the connector URL");

// Last, because it blocks this client: guessing codes (guard.ts). One wrong code came above; 20 more pass the limit.
for (let i = 0; i < 20; i++) await call(c, "get_progress", { learner_code: `NOPE-${2222 + i}` });
r = await call(c, "get_progress", { learner_code: code });
assert(r.error?.includes("paused for 10 minutes"), "after 21 wrong codes a minute, even a right code waits");
r = await call(c, "start_lesson", {});
assert(r.learner_code && !r.error, "a new learner without a code can still start");

await c.close();
stop();
console.log("all checks passed");
