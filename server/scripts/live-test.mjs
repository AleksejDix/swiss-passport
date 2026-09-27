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
const call = async (c, name, args = {}) => JSON.parse((await c.callTool({ name, arguments: args })).content[0].text);

let c = await connect();
const { learner_code: code } = await call(c, "get_progress", { language: "en" });
assert(code, `new learner code ${code}`);
let step = await call(c, "start_lesson", { learner_code: code });
const r = await call(c, "answer", { learner_code: code, answer: key[step.question.id] });
assert(r.feedback?.correct && r.next?.step === "2/9", "answer checked, next step served");
await c.close();

c = await connect(); // new connection, possibly another function instance: progress must come from the database
const p = await call(c, "get_progress", { learner_code: code });
assert(p.unfinished_session?.step === "2/9", "progress stored in the database and loaded again");
const card = await c.readResource({ uri: "ui://swiss-passport/card-v7.html" });
assert(card.contents[0].text.length > 1000, "quiz card served");
await c.close();
console.log("live checks passed");
