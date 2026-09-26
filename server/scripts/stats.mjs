// Learning statistics from the progress database. Only totals leave the database, never a learner code.
// Usage: npm run stats              production (D1 on Cloudflare)
//        npm run stats -- --local   the local D1 of `npm run dev:worker`
// Opening /learn creates a learner code, so "learner codes" also counts people who only looked;
// "answered a question" is the better measure of learners.
import { execFileSync } from "node:child_process";

const where = process.argv.includes("--local") ? "--local" : "--remote";
const since = (days) => `'${new Date(Date.now() - days * 86_400_000).toISOString()}'`;
const answered = "(SELECT COUNT(*) FROM json_each(progress, '$.answered'))";

const QUERIES = {
  Learners: `SELECT COUNT(*) AS "learner codes", SUM(${answered} > 0) AS "answered a question",
      SUM(updated_at >= ${since(1)}) AS "active today", SUM(updated_at >= ${since(7)}) AS "active in 7 days",
      SUM(updated_at >= ${since(30)}) AS "active in 30 days", SUM(json_extract(progress, '$.session') IS NOT NULL) AS "in a round now"
    FROM learners`,
  "Languages (learners who answered)": `SELECT COALESCE(json_extract(progress, '$.language'), 'de') AS language, COUNT(*) AS learners
    FROM learners WHERE ${answered} > 0 GROUP BY 1 ORDER BY 2 DESC`,
  "Questions answered per learner (of 350)": `SELECT CASE WHEN n < 10 THEN '1-9' WHEN n < 50 THEN '10-49' WHEN n < 150 THEN '50-149'
      WHEN n < 350 THEN '150-349' ELSE 'all 350' END AS questions, COUNT(*) AS learners
    FROM (SELECT ${answered} AS n FROM learners) WHERE n > 0 GROUP BY 1 ORDER BY MIN(n)`,
  // The latest first attempt per question and learner (repeats within a round are not counted).
  Answers: `SELECT COUNT(*) AS "questions answered", ROUND(100.0 * SUM(json_extract(a.value, '$.correct')) / COUNT(*), 1) AS "% correct"
    FROM learners, json_each(learners.progress, '$.answered') AS a`,
  "Mock exams": `SELECT COUNT(*) AS "mock exams", COUNT(DISTINCT learners.code) AS learners,
      ROUND(AVG(100.0 * json_extract(e.value, '$.score') / json_extract(e.value, '$.total')), 1) AS "average %"
    FROM learners, json_each(learners.progress, '$.exams') AS e`,
};

const sql = Object.values(QUERIES).map((q) => q.replace(/\s+/g, " ")).join("; ");
const output = execFileSync("npx", ["wrangler", "d1", "execute", "swiss-passport", where, "--json", "--command", sql], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
const results = JSON.parse(output);

Object.entries(QUERIES).forEach(([title, query], i) => {
  const rows = results[i].results;
  console.log(`\n${title}`);
  if (rows.length === 0) return console.log("  none yet");
  // Grouped queries print one line per group; the others one line per figure.
  const lines = /GROUP BY/.test(query) ? rows.map((row) => Object.values(row)) : Object.entries(rows[0]);
  for (const [label, value] of lines) console.log(`  ${String(label).padEnd(22)} ${value ?? 0}`);
});
