// The date each page's content last changed, for <lastmod> in the sitemap, taken from git history.
// Question and topic pages: the last commit that changed their text in that language (i18n/<lang>.json)
// or their language-neutral data (quiz.json: answer, options, pictures; curriculum.json: sources, questions).
// Other pages: the last commit of the files that hold their text. Layout changes do not count; search
// engines trust <lastmod> only while it means the content changed. Without git history (for example a
// shallow clone that cannot be deepened) there are no dates: none is better than wrong ones.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const git = (...args) => execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

function history() {
  try {
    if (git("rev-parse", "--is-shallow-repository").trim() === "true") git("fetch", "--quiet", "--unshallow");
    return git("rev-parse", "--is-shallow-repository").trim() === "false";
  } catch {
    return false;
  }
}

/** Last commit date of each part of a JSON file: `parts(json)` returns [key, value] pairs. */
function partDates(file, parts) {
  const dates = new Map();
  const seen = new Map();
  const commits = git("log", "--reverse", "--format=%H %cI", "--", file).trim().split("\n").filter(Boolean);
  for (const line of commits) {
    const [sha, date] = line.split(" ");
    let json;
    try {
      json = JSON.parse(git("show", `${sha}:${file}`));
    } catch {
      continue; // the file was deleted or not valid JSON in this commit
    }
    for (const [key, value] of parts(json)) {
      const text = JSON.stringify(value);
      if (seen.get(key) !== text) dates.set(key, date);
      seen.set(key, text);
    }
  }
  return dates;
}

const lastCommit = (...files) => git("log", "-1", "--format=%cI", "--", ...files).trim() || undefined;
const latest = (...dates) => dates.filter(Boolean).sort().at(-1);

// Pages whose text lives in their own files (the text modules, not the templates, whose changes are layout).
const PAGES = [
  [/^\/[a-z]{2}\/$/, ["site/src/scripts/i18n.js"]],
  [/^\/[a-z]{2}\/method\/$/, ["site/src/method.js"]],
  [/^\/[a-z]{2}\/grundkenntnistest\/$/, ["site/src/guide.js"]],
  [/^\/[a-z]{2}\/about\/$/, ["site/src/about.js"]],
  [/^\/[a-z]{2}\/connect\/$/, ["site/src/connect.js"]],
  [/^\/impressum\/$/, ["site/src/pages/impressum.astro", "site/src/legal.js"]],
  [/^\/datenschutz\/$/, ["site/src/pages/datenschutz.astro", "site/src/legal.js"]],
];

/** A function from a page path (/de/questions/17-.../) to its lastmod date (ISO 8601), or undefined. */
export function lastmodFor(langs) {
  if (!history()) {
    console.warn("lastmod: no git history, the sitemap has no dates");
    return () => undefined;
  }
  const { concepts } = JSON.parse(readFileSync(new URL("curriculum.json", `file://${ROOT}`), "utf8"));
  const quiz = partDates("quiz.json", (j) => j.questions.map((q) => [q.id, q]));
  const curriculum = partDates("curriculum.json", (j) => j.concepts.map((c) => [c.id, c]));
  const text = Object.fromEntries(langs.map((lang) => [lang, partDates(`i18n/${lang}.json`, (j) => [
    ...Object.entries(j.questions).map(([id, v]) => [`q:${id}`, v]),
    ...Object.entries(j.concepts).map(([id, v]) => [`c:${id}`, v]),
  ])]));
  const conceptOf = new Map(concepts.flatMap((c) => c.questions.map((id) => [id, c])));

  // A question page shows the question, its topic's title, first paragraph and sources.
  const question = (lang, id) => {
    const c = conceptOf.get(id);
    return c && latest(text[lang].get(`q:${id}`), quiz.get(id), text[lang].get(`c:${c.id}`), curriculum.get(c.id));
  };
  // A topic page shows the topic and the text and answer of each of its questions.
  const topic = (lang, id) => {
    const c = concepts.find((k) => k.id === id);
    return c && latest(text[lang].get(`c:${id}`), curriculum.get(id), ...c.questions.map((q) => latest(text[lang].get(`q:${q}`), quiz.get(q))));
  };

  const fileDates = new Map();
  return (path) => {
    let m;
    // Question slugs start with the number of the question: /de/questions/17-welche-pflichten-.../
    if ((m = path.match(/^\/([a-z]{2})\/questions\/(\d+)-/)) && text[m[1]]) return question(m[1], `q${m[2].padStart(3, "0")}`);
    if ((m = path.match(/^\/([a-z]{2})\/topics\/([a-z0-9-]+)\/$/)) && text[m[1]]) return topic(m[1], m[2].replace(/-/g, "_"));
    if ((m = path.match(/^\/([a-z]{2})\/questions\/$/)) && text[m[1]]) return latest(...concepts.map((c) => topic(m[1], c.id)));
    const files = PAGES.find(([re]) => re.test(path))?.[1];
    if (!files) return undefined;
    const key = files.join(" ");
    if (!fileDates.has(key)) fileDates.set(key, lastCommit(...files));
    return fileDates.get(key);
  };
}
