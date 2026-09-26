// One-off move of learner progress from Upstash Redis (old Vercel server) to D1. Safe to run again:
// a row is only replaced when the Redis copy is newer. Delete this script once the old server is gone.
// Usage: KV_REST_API_URL=... KV_REST_API_TOKEN=... node scripts/upstash-to-d1.mjs > /tmp/learners.sql
//        npx wrangler d1 execute swiss-passport --remote --file=/tmp/learners.sql
const { KV_REST_API_URL: url, KV_REST_API_TOKEN: token } = process.env;
if (!url || !token) throw new Error("set KV_REST_API_URL and KV_REST_API_TOKEN");
const redis = async (...cmd) => {
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(cmd) });
  return (await res.json()).result;
};

const keys = [];
let cursor = "0";
do {
  const [next, batch] = await redis("SCAN", cursor, "MATCH", "learner:*", "COUNT", 1000);
  keys.push(...batch);
  cursor = next;
} while (cursor !== "0");

const sql = (s) => `'${s.replace(/'/g, "''")}'`;
for (const key of keys) {
  const raw = await redis("GET", key);
  if (!raw) continue;
  const p = typeof raw === "string" ? JSON.parse(raw) : raw;
  // Last activity: the newest answer or mock exam, so the 12-month deletion clock stays correct.
  const times = [...Object.values(p.answered ?? {}).map((a) => a.at), ...(p.exams ?? []).map((e) => e.at)].filter(Boolean).sort();
  const updated = times.at(-1) ?? new Date().toISOString();
  console.log(
    `INSERT INTO learners (code, progress, updated_at) VALUES (${sql(key.slice("learner:".length))}, ${sql(JSON.stringify(p))}, ${sql(updated)}) ` +
      "ON CONFLICT(code) DO UPDATE SET progress = excluded.progress, updated_at = excluded.updated_at WHERE excluded.updated_at > learners.updated_at;",
  );
}
console.error(`${keys.length} learners`);
