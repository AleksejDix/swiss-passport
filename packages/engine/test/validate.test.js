// validateCatalog names every way a catalog can fail to fit together.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCatalog } from "../dist/index.js";

const valid = () => ({
  exam: { name: "a test course", size: 1, pass_mark: "not set" },
  languages: ["en", "de"],
  questions: [
    { id: "q1", category: "c", level: "l", options: [{ id: "a" }, { id: "b" }], answer: "a" },
    { id: "q2", category: "c", level: "l", options: [{ id: "a" }, { id: "b" }], answer: "b" },
  ],
  curriculum: {
    units: [{ id: "u1", lessons: ["l1", "l2"] }],
    lessons: [
      { id: "l1", unit: "u1", concepts: ["t1"] },
      { id: "l2", unit: "u1", requires: ["l1"], concepts: ["t2"] },
    ],
    concepts: [
      { id: "t1", lesson: "l1", questions: ["q1"], sources: [] },
      { id: "t2", lesson: "l2", questions: ["q2"], sources: [] },
    ],
  },
  texts: {
    en: {
      title: "Course",
      categories: { c: "Category" },
      levels: { l: "Level" },
      units: { u1: { title: "Unit" } },
      lessons: { l1: { title: "One" }, l2: { title: "Two" } },
      concepts: { t1: { title: "T1", intro: [], key_terms: [] }, t2: { title: "T2", intro: [], key_terms: [] } },
      questions: {
        q1: { question: "One?", options: { a: "Yes", b: "No" } },
        q2: { question: "Two?", options: { a: "Yes", b: "No" } },
      },
    },
    de: { title: "Kurs", categories: {}, levels: {}, questions: {} },
  },
});

test("a valid catalog has no problems", () => {
  assert.deepEqual(validateCatalog(valid()), []);
});

test("questions: duplicate ids, too few options, an answer that is no option", () => {
  const c = valid();
  c.questions.push({ ...c.questions[0] });
  c.questions[1].options = [{ id: "a" }];
  c.questions[1].answer = ["a", "c", "a"];
  assert.deepEqual(validateCatalog(c), [
    "question q1 is there more than once",
    "question q2 has fewer than two options",
    "question q2 has the answer a more than once",
    "question q2: its answer c is no option",
  ]);
});

test("curriculum: questions without a topic, broken links and cycles", () => {
  const c = valid();
  c.curriculum.concepts[1].questions = ["q9"];
  c.curriculum.lessons[0].requires = ["l2"];
  c.curriculum.lessons[1].unit = "u9";
  assert.deepEqual(validateCatalog(c), [
    "topic t2 has question q9, which does not exist",
    "question q2 is in 0 topics instead of one",
    "unit u1 lists lesson l2, which is not in it",
    "lesson l2 is not listed in unit u9",
    "lessons require each other in a circle: l1 -> l2 -> l1",
  ]);
});

test("texts: the first language needs every text, a translated question needs every option", () => {
  const c = valid();
  delete c.texts.en.questions.q2;
  delete c.texts.en.lessons.l2;
  c.texts.en.questions.q1.distractors = { a: "Wrong." };
  c.texts.de.questions.q1 = { question: "Eins?", options: { a: "Ja" } };
  c.languages.push("fr");
  assert.deepEqual(validateCatalog(c), [
    "en: question q1 says why a is wrong, but it is right",
    "en: question q2 has no text",
    "en: lesson l2 has no title",
    "de: question q1 has no text for option b",
    "there are no texts in fr",
  ]);
});
