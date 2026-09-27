// Builds scripts/preview/out/index.html with real tool results from the server.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { build } from "esbuild";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const client = new Client({ name: "preview", version: "0" });
await client.connect(
  new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    // A new learner every run: the first sample is what a new learner sees.
    env: { ...process.env, PROGRESS_FILE: join(mkdtempSync(join(tmpdir(), "spz-preview-")), "progress.json") },
  }),
);
const call = (name, args) => client.callTool({ name, arguments: args });
const key = Object.fromEntries(
  JSON.parse(readFileSync("data/quiz.json", "utf8")).questions.map((q) => [q.id, q.answer]),
);

// Walk lesson l01 (Russian) until the flag question, answering the question before it wrong.
const samples = [];
let r = await call("start_lesson", { language: "en" });
samples.push({ label: "New learner (en): lessons to choose from", result: r });
r = await call("start_lesson", { language: "ru", lesson_id: "l01" });
samples.push({ label: "Lesson start (ru): concept + first question", result: r });
// ChatGPT gets the card's data in _meta (the "openai/..." key marks a ChatGPT call).
const viaChatGPT = await client.callTool({
  name: "start_lesson",
  arguments: { lesson_id: "l01" },
  _meta: { "openai/userAgent": "preview" },
});
samples.push({ label: "ChatGPT: same step, card data in _meta", result: viaChatGPT });
for (;;) {
  const step = JSON.parse(r.content[0].text);
  const qid = (step.next ?? step).question.id;
  if (qid === "q055") break;
  r = await call("answer", { answer: qid === "q327" ? (key[qid] === "a" ? "b" : "a") : key[qid] });
}
samples.push({ label: "Wrong answer feedback + flag question with pictures", result: r });
r = await call("start_lesson", { language: "de", lesson_id: "l34" });
for (;;) {
  const step = JSON.parse(r.content[0].text);
  const qid = (step.next ?? step).question.id;
  if (qid === "q289") break;
  r = await call("answer", { answer: key[qid] });
}
samples.push({ label: "Map question (de) after a correct answer", result: r });
await client.close();

// Escape "</" so the embedded HTML cannot close the surrounding <script> tag.
const safe = (v) => JSON.stringify(v).replaceAll("</", "<\\/");
const host = await build({ entryPoints: ["scripts/preview/host.ts"], bundle: true, format: "esm", write: false });
mkdirSync("scripts/preview/out", { recursive: true });
writeFileSync(
  "scripts/preview/out/index.html",
  `<!doctype html><meta charset="utf-8"><title>Card preview</title>
<style>body{font-family:sans-serif;background:#ddd;display:flex;flex-wrap:wrap;gap:16px;padding:16px}section{background:#fff;padding:8px;border-radius:8px}iframe{width:420px;height:560px;border:1px solid #ccc;border-radius:8px}pre{font-size:11px;white-space:pre-wrap;width:420px}</style>
<script>const CARD_HTML=${safe(readFileSync("data/card.html", "utf8"))};const SAMPLES=${safe(samples)};</script>
<script type="module">${host.outputFiles[0].text}</script>`,
);
console.log("preview written");
