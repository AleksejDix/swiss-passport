// Questions that are not four options with one answer: true or false, three options, and "pick every right option".
// The course is in two languages, so the step also shows the original wording.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEngine, emptyProgress, validateCatalog } from "../dist/index.js";

const catalog = {
  exam: { name: "a phishing course", size: 2, pass_mark: "not set" },
  languages: ["en", "fr"],
  questions: [
    { id: "tf", category: "mail", level: "basic", options: [{ id: "a" }, { id: "b" }], answer: "b" },
    {
      id: "multi",
      category: "mail",
      level: "basic",
      options: [{ id: "a" }, { id: "b" }, { id: "c" }],
      answer: ["a", "c"],
    },
  ],
  curriculum: {
    units: [{ id: "u1", lessons: ["l1"] }],
    lessons: [{ id: "l1", unit: "u1", concepts: ["c1"] }],
    concepts: [{ id: "c1", lesson: "l1", questions: ["tf", "multi"], sources: [] }],
  },
  texts: {
    en: {
      title: "Phishing",
      categories: { mail: "Email" },
      levels: { basic: "Basic" },
      units: { u1: { title: "Email" } },
      lessons: { l1: { title: "Spotting phishing" } },
      concepts: { c1: { title: "Signs of phishing", intro: ["Look at the sender."], key_terms: [] } },
      questions: {
        tf: {
          question: "Your bank asks for your PIN by email. Is that normal?",
          options: { a: "True", b: "False" },
          why: "Banks never ask.",
        },
        multi: {
          question: "Which are signs of phishing?",
          options: { a: "Urgency", b: "Your name", c: "A strange sender" },
          why: "Pressure and odd senders are typical.",
          distractors: { b: "Attackers know your name too, but it is no sign." },
        },
      },
    },
    fr: {
      title: "Hameçonnage",
      categories: {},
      levels: {},
      questions: {
        multi: {
          question: "Quels sont des signes d'hameçonnage ?",
          options: { a: "L'urgence", b: "Votre nom", c: "Un expéditeur étrange" },
        },
      },
    },
  },
};
const engine = createEngine(catalog);

test("the catalog is valid", () => {
  assert.deepEqual(validateCatalog(catalog), []);
});

test("a true-or-false question has two options and one answer", () => {
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  const step = engine.currentStep(p.session, "en");
  assert.deepEqual(Object.keys(step.question.options), ["a", "b"]);
  assert.equal(step.question.multiple, undefined);
  const r = engine.answer(p, "b", "en");
  assert.equal(r.feedback.correct, true);
  assert.equal(r.feedback.correct_answer_text, "False");
});

test("a question with a list as answer asks for every right option, in any order", () => {
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  engine.answer(p, "b", "en");
  assert.equal(engine.currentStep(p.session, "en").question.multiple, true);

  const wrong = engine.answer(p, ["a", "b"], "en");
  assert.equal(wrong.feedback.correct, false);
  assert.deepEqual(wrong.feedback.correct_answer, ["a", "c"]);
  assert.deepEqual(wrong.feedback.correct_answer_text, ["Urgency", "A strange sender"]);
  assert.equal(wrong.feedback.about_your_answer, "Attackers know your name too, but it is no sign.");

  const right = engine.answer(p, ["c", "a"], "en");
  assert.equal(right.feedback.correct, true);
  assert.equal(right.finished.correct_first_try, 1);
});

test("in another language the step and the feedback show the original wording", () => {
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  engine.answer(p, "b", "fr");
  const step = engine.currentStep(p.session, "fr");
  assert.equal(step.question.question, "Quels sont des signes d'hameçonnage ?");
  assert.equal(step.question.original.question, "Which are signs of phishing?");
  const r = engine.answer(p, ["a", "c"], "fr");
  assert.deepEqual(r.feedback.correct_answer_text, ["L'urgence", "Un expéditeur étrange"]);
  assert.deepEqual(r.feedback.correct_answer_original, ["Urgency", "A strange sender"]);
  // A text the translation leaves out comes from the first language.
  assert.equal(r.feedback.why, "Pressure and odd senders are typical.");
});
