// The content files fit together: quiz.json (questions and answers), curriculum.json (units, lessons, topics)
// and one i18n/<code>.json per language. Run with `npm run test:data`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("quiz.json: ids are unique, four options a to d, the answer is one of them", () => {
  assert.equal(quiz.questions.length, quiz.count);
  assert.equal(new Set(quiz.questions.map((q) => q.id)).size, quiz.questions.length);
  for (const q of quiz.questions) {
    assert.deepEqual(
      q.options.map((o) => o.id),
      ["a", "b", "c", "d"],
      q.id,
    );
    assert.ok(["a", "b", "c", "d"].includes(q.answer), q.id);
  }
});

test("quiz.json: every picture exists", () => {
  const images = quiz.questions.flatMap((q) => [q.image, ...q.options.map((o) => o.image)]).filter(Boolean);
  assert.ok(images.length > 0);
  for (const path of images) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
});

test("curriculum.json: every question belongs to exactly one topic", () => {
  const counts = new Map(quiz.questions.map((q) => [q.id, 0]));
  for (const c of concepts) for (const id of c.questions) counts.set(id, (counts.get(id) ?? 0) + 1);
  assert.deepEqual(
    [...counts].filter(([, n]) => n !== 1),
    [],
  );
});

test("curriculum.json: units, lessons and topics point at each other", () => {
  const lessonIds = new Set(lessons.map((l) => l.id));
  const conceptIds = new Set(concepts.map((c) => c.id));
  for (const u of units)
    for (const id of u.lessons) assert.equal(lessons.find((l) => l.id === id)?.unit, u.id, `${u.id} -> ${id}`);
  for (const l of lessons) {
    for (const id of l.concepts) assert.equal(concepts.find((c) => c.id === id)?.lesson, l.id, `${l.id} -> ${id}`);
    for (const id of l.requires ?? []) assert.ok(lessonIds.has(id), `${l.id} requires ${id}`);
  }
  for (const c of concepts) {
    assert.ok(lessonIds.has(c.lesson), `${c.id} is in ${c.lesson}`);
    assert.ok(conceptIds.has(c.id));
    for (const src of c.sources ?? []) assert.match(src, /^https:\/\//, `${c.id}: source ${src}`);
  }
});

test("curriculum.json: prerequisites have no cycles", () => {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const visit = (id, seen = []) => {
    assert.ok(!seen.includes(id), `cycle: ${[...seen, id].join(" -> ")}`);
    for (const r of byId.get(id).requires ?? []) visit(r, [...seen, id]);
  };
  for (const l of lessons) visit(l.id);
});

test("every unit, lesson and topic has a title in every language", () => {
  for (const lang of LANGUAGES) {
    const t = TEXTS[lang];
    for (const u of units) assert.ok(t.units[u.id]?.title, `${lang} ${u.id}`);
    for (const l of lessons) assert.ok(t.lessons[l.id]?.title, `${lang} ${l.id}`);
    for (const c of concepts) assert.ok(t.concepts[c.id]?.title, `${lang} ${c.id}`);
  }
});
