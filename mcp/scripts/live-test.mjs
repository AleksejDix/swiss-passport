// Checks a deployed server: node scripts/live-test.mjs https://<host>
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const base = process.argv[2]?.replace(/\/$/, "");
if (!base) throw new Error("usage: node scripts/live-test.mjs https://<host>");
const key = Object.fromEntries(
  JSON.parse(readFileSync(new URL("../data/quiz.json", import.meta.url), "utf8")).questions.map((q) => [
    q.id,
    q.answer,
  ]),
);
const assert = (ok, msg) => {
  if (!ok) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
};
const connect = async () => {
  const c = new Client({ name: "live-test", version: "0" });
  await c.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
  return c;
};
const call = async (c, name, args = {}) => {
  const r = JSON.parse((await c.callTool({ name, arguments: args })).content[0].text);
  // Wrong learner codes (guard.ts) pause every request with a code from this IP for 10 minutes, testing included.
  if (r.error?.includes("paused")) {
    console.error(`BLOCKED: this IP sent too many wrong learner codes. Wait 10 minutes, then run again.\n${r.error}`);
    process.exit(2);
  }
  return r;
};

let c = await connect();
const fresh = await call(c, "get_progress", { language: "en" });
assert(
  !fresh.learner_code && fresh.new_or_continuing,
  "without a code, the learner is asked: from scratch or continue?",
);
const choices = await call(c, "start_lesson", { language: "en", new_learner: true });
const code = choices.learner_code;
assert(
  code && choices.lesson_choices?.length > 1,
  `the first start_lesson creates the learner code ${code} and offers lessons`,
);
const step = await call(c, "start_lesson", { learner_code: code, lesson_id: "l01" });
const r = await call(c, "answer", { learner_code: code, answer: key[step.question.id] });
assert(r.feedback?.correct && r.next?.step === "2/9", "answer checked, next step served");
await c.close();

c = await connect(); // new connection, possibly another function instance: progress must come from the database
const p = await call(c, "get_progress", { learner_code: code });
assert(p.unfinished_session?.step === "2/9", "progress stored in the database and loaded again");
const card = await c.readResource({ uri: "ui://swiss-passport/card-v9.html" });
assert(card.contents[0].text.length > 1000, "quiz card served");
await c.close();
console.log("live checks passed");
