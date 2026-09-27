// The content files fit together: quiz.json (questions and answers), curriculum.json (units, lessons, topics)
// and one i18n/<code>.json per language. Run with `npm run test:data`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { validateCatalog } from "@aleksejdix/learning-engine";
import { TEXTS, LANGUAGES } from "../i18n/index.js";

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const quiz = read("quiz.json");
const { units, lessons, concepts } = read("curriculum.json");
const de = TEXTS.de;

// Words that change with a number are objects of plural forms ({ one, other } in German, { one, few, many, other }
// in Russian). Each language has its own forms, so such an object counts as one text.
const PLURAL = new Set(["zero", "one", "two", "few", "many", "other"]);
const isPlural = (value) =>
  value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).every((k) => PLURAL.has(k));

/** Every path to a text in a JSON tree, arrays included: "site.home.h1", "concepts.x.intro.0". */
function paths(value, prefix = "") {
  if (value && typeof value === "object" && !isPlural(value)) {
    return Object.entries(value).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}
const placeholders = (text) => [...new Set([...JSON.stringify(text).matchAll(/\{[a-z_]+\}/g)].map((m) => m[0]))].sort();
const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

test("German comes first: the exam is in German", () => {
  assert.equal(LANGUAGES[0], "de");
});

for (const lang of LANGUAGES.slice(1)) {
  test(`${lang}.json has exactly the keys of de.json`, () => {
    const own = new Set(paths(TEXTS[lang]));
    const german = new Set(paths(de));
    assert.deepEqual(
      [...german].filter((p) => !own.has(p)),
      [],
      "missing in this language",
    );
    assert.deepEqual(
      [...own].filter((p) => !german.has(p)),
      [],
      "only in this language",
    );
  });

  test(`${lang}.json keeps every {placeholder} of de.json`, () => {
    const wrong = paths(de).filter((p) => placeholders(get(de, p)).join() !== placeholders(get(TEXTS[lang], p)).join());
    assert.deepEqual(wrong, []);
  });
}

for (const lang of LANGUAGES) {
  test(`${lang}.json has every plural form its language needs`, () => {
    // The site counts questions, seats and members, never millions; a missing form falls back to "other".
    const rules = new Intl.PluralRules(TEXTS[lang].language);
    const needed = [...new Set(["other", ...Array.from({ length: 1001 }, (_, n) => rules.select(n))])];
    const forms = paths(TEXTS[lang])
      .map((p) => [p, get(TEXTS[lang], p)])
      .filter(([, v]) => isPlural(v));
    assert.ok(forms.length > 0);
    for (const [p, v] of forms)
      assert.deepEqual(
        needed.filter((c) => !(c in v)),
        [],
        p,
      );
  });

  test(`${lang}.json has no empty texts`, () => {
    assert.deepEqual(
      paths(TEXTS[lang]).filter((p) => get(TEXTS[lang], p) === ""),
      [],
    );
  });

  test(`${lang}.json translates every question with all four options and an explanation`, () => {
    for (const q of quiz.questions) {
      const t = TEXTS[lang].questions[q.id];
      assert.ok(t?.question && t.why, `${q.id}: question and why`);
      for (const o of q.options) assert.ok(t.options[o.id], `${q.id}: option ${o.id}`);
      // Why a wrong answer is wrong: never for the right one.
      assert.ok(!(q.answer in (t.distractors ?? {})), `${q.id}: no distractor text for the right answer`);
    }
  });
}

// Ids, answers, topics, lessons, units, prerequisites and titles: the engine's own checks.
test("the catalog fits together", () => {
  const exam = { name: "Grundkenntnistest", size: 50, pass_mark: "not published" };
  const catalog = {
    exam,
    languages: LANGUAGES,
    questions: quiz.questions,
    curriculum: { units, lessons, concepts },
    texts: TEXTS,
  };
  assert.deepEqual(validateCatalog(catalog), []);
});

test("quiz.json: four options a to d and one answer, as in the real test", () => {
  assert.equal(quiz.questions.length, quiz.count);
  for (const q of quiz.questions) {
    assert.deepEqual(
      q.options.map((o) => o.id),
      ["a", "b", "c", "d"],
      q.id,
    );
    assert.equal(typeof q.answer, "string", q.id);
  }
});

test("quiz.json: every picture exists", () => {
  const images = quiz.questions.flatMap((q) => [q.image, ...q.options.map((o) => o.image)]).filter(Boolean);
  assert.ok(images.length > 0);
  for (const path of images) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
});

test("curriculum.json: every source is an https link", () => {
  for (const c of concepts)
    for (const src of c.sources ?? []) assert.match(src, /^https:\/\//, `${c.id}: source ${src}`);
});
