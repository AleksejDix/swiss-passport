// REST API /api/v1 without a server: the limits per client (429 and the 10-minute block after wrong learner codes),
// which are off in the e2e tests, and the answer when something breaks. Bundles the API from the sources with esbuild.
import { build } from "esbuild";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const bundle = join(mkdtempSync(join(tmpdir(), "spz-api-")), "api.mjs");
await build({
  stdin: {
    contents: `export { handleApi } from "./src/api/api.ts"; export { memoryGuard } from "./src/guard.ts";`,
    resolveDir: fileURLToPath(new URL("..", import.meta.url)),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  logLevel: "error",
});
const { handleApi, memoryGuard } = await import(bundle);

const assert = (ok, msg) => {
  if (!ok) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
};

const memoryStore = () => {
  const rows = new Map();
  return {
    load: async (code) => (rows.has(code) ? structuredClone(rows.get(code)) : undefined),
    save: async (code, p) => void rows.set(code, structuredClone(p)),
  };
};

let time = 0;
const guard = memoryGuard({ now: () => time });
const store = memoryStore();
/** The API as the Worker calls it, for a client with this IP address. */
const api = (request, store, client) => handleApi(request, { store, guard, client });
const post = (path, body, ip = "1.1.1.1", s = store) =>
  api(
    new Request(`https://x.test/api/v1${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": ip },
      body: JSON.stringify(body),
    }),
    s,
    ip,
  );

const index = await api(new Request("https://x.test/api/v1"), store, "1.1.1.1");
assert(index.status === 200 && (await index.json()).version === "v1", "GET /api/v1 answers without a guard check");

// New learners: 30 a minute per client.
const created = [];
for (let i = 0; i < 30; i++) created.push(await post("/learners", { language: "en" }, "2.2.2.2"));
assert(
  created.every((r) => r.status === 201),
  "30 new learners a minute from one client",
);
const tooManyNew = await post("/learners", {}, "2.2.2.2");
assert(
  tooManyNew.status === 429 && tooManyNew.headers.get("retry-after") === "60",
  "the 31st new learner waits a minute",
);
assert(tooManyNew.headers.get("x-content-type-options") === "nosniff", "a 429 has the JSON headers too");
assert((await post("/learners", {}, "3.3.3.3")).status === 201, "another client may still make learners");

// Wrong codes: 20 a minute per client, then every request for a learner is blocked for 10 minutes.
const { learner_code } = await (await post("/learners", {})).json();
assert((await post("/progress", { learner_code })).status === 200, "a known code works");
for (let i = 0; i < 10; i++) await post("/progress", { learner_code: "BERG-2222" });
for (let i = 0; i < 10; i++) await post("/progress", { learner_code: "not a code" });
assert((await post("/progress", { learner_code })).status === 200, "20 wrong codes (unknown or malformed) are allowed");
const wrong = await post("/progress", { learner_code: "BERG-2223" });
assert(wrong.status === 404, "the 21st wrong code still gets 404");
const blocked = await post("/progress", { learner_code });
assert(
  blocked.status === 429 && blocked.headers.get("retry-after") === "600",
  "after 21 wrong codes even a right code waits 600 seconds",
);
assert((await post("/progress", {})).status === 429, "while blocked, a request without a code gets 429 too");
assert((await post("/answers", { learner_code, answer: "a" })).status === 429, "every learner endpoint is blocked");
assert((await post("/answers", { learner_code, answer: "e" })).status === 400, "the body is checked before the block");
assert((await post("/learners", {})).status === 201, "a blocked client may still make a new learner");
assert((await post("/progress", { learner_code }, "4.4.4.4")).status === 200, "other clients are not blocked");
time += 601_000;
assert((await post("/progress", { learner_code })).status === 200, "after 10 minutes the code works again");

// Something breaks: 500 without details, and the log holds no learner code.
const logged = [];
const consoleError = console.error;
console.error = (...args) => logged.push(args.join(" "));
const broken = {
  load: async () => {
    throw new Error("database down");
  },
  save: async () => {},
};
const failed = await post("/progress", { learner_code: "BERG-7K2Q" }, "5.5.5.5", broken);
console.error = consoleError;
assert(
  failed.status === 500 && (await failed.json()).error === "Something went wrong. Try again.",
  "an error is a 500",
);
assert(logged.join("").includes("database down") && !logged.join("").includes("BERG-7K2Q"), "the log has no code");

console.log("all checks passed");
