// Tests of the engine alone, with a small catalog that has nothing to do with Switzerland:
// two units, three lessons (l2 requires l1), one topic per lesson, two questions per topic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEngine, emptyProgress, lessonStages } from "../dist/index.js";

const q = (id, category) => ({
  id,
  category,
  level: "basic",
  options: ["a", "b", "c", "d"].map((l) => ({ id: l })),
  answer: "a",
});
const text = (question) => ({ question, options: { a: "right", b: "wrong", c: "wrong", d: "wrong" }, why: "Because." });
const IDS = ["q1", "q2", "q3", "q4", "q5", "q6"];
const catalog = {
  exam: { name: "a test course", size: 4, pass_mark: "not set" },
  languages: ["en"],
  questions: [
    q("q1", "privacy"),
    q("q2", "privacy"),
    q("q3", "privacy"),
    q("q4", "privacy"),
    q("q5", "gifts"),
    q("q6", "gifts"),
  ],
  curriculum: {
    units: [
      { id: "u1", lessons: ["l1", "l2"] },
      { id: "u2", lessons: ["l3"] },
    ],
    lessons: [
      { id: "l1", unit: "u1", requires: [], concepts: ["c1"] },
      { id: "l2", unit: "u1", requires: ["l1"], concepts: ["c2"] },
      { id: "l3", unit: "u2", concepts: ["c3"] },
    ],
    concepts: [
      { id: "c1", lesson: "l1", questions: ["q1", "q2"], sources: [] },
      { id: "c2", lesson: "l2", questions: ["q3", "q4"], sources: [] },
      { id: "c3", lesson: "l3", questions: ["q5", "q6"], sources: [] },
    ],
  },
  texts: {
    en: {
      title: "Test course",
      categories: { privacy: "Privacy", gifts: "Gifts" },
      levels: { basic: "Basic" },
      units: { u1: { title: "Data" }, u2: { title: "Conduct" } },
      lessons: { l1: { title: "Personal data" }, l2: { title: "Sharing data" }, l3: { title: "Gifts" } },
      concepts: Object.fromEntries(["c1", "c2", "c3"].map((c) => [c, { title: c, intro: ["Intro."], key_terms: [] }])),
      questions: Object.fromEntries(IDS.map((id) => [id, text(`Question ${id}?`)])),
    },
  },
};

const engine = createEngine(catalog);
const DAY = 24 * 60 * 60 * 1000;

/** Answers every question of the running session with the given letter (right = "a"). */
function finish(p, letter = "a", now = new Date()) {
  let r;
  while (p.session) r = engine.answer(p, letter, "en", now);
  return r;
}

test("stages follow the prerequisites", () => {
  assert.deepEqual(Object.fromEntries(lessonStages(catalog.curriculum)), { l1: 0, l2: 1, l3: 0 });
});

test("a new learner may start in every unit; the first unit is recommended", () => {
  const p = emptyProgress();
  assert.deepEqual(
    engine.progress(p, "en").lesson_choices.map((c) => c.id),
    ["l1", "l3"],
  );
  assert.equal(engine.nextLessonId(p), "l1");
});

test("after a lesson the other unit comes first, and the next lesson of the unit opens", () => {
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  finish(p);
  const progress = engine.progress(p, "en");
  assert.equal(progress.lessons_done, 1);
  assert.deepEqual(
    progress.lesson_choices.map((c) => c.id),
    ["l3", "l2"],
  );
  assert.equal(progress.next_lesson.id, "l3");
});

test("a lesson is locked until its prerequisites are done", () => {
  const p = emptyProgress();
  assert.ok(!engine.progress(p, "en").lesson_choices.some((c) => c.id === "l2"));
});

test("a right answer schedules the topic for tomorrow; a wrong one comes back in the same round", () => {
  const p = emptyProgress();
  const now = new Date("2026-01-01T10:00:00Z");
  engine.startLesson(p, "l1", false);
  const first = engine.answer(p, "a", "en", now);
  assert.equal(first.feedback.correct, true);
  assert.equal(first.feedback.review.level, 1);
  assert.equal(new Date(first.feedback.review.next_review).getTime(), now.getTime() + DAY);
  const second = engine.answer(p, "b", "en", now);
  assert.equal(second.feedback.correct, false);
  assert.equal(second.feedback.comes_again_later_in_this_round, true);
  assert.equal(second.next.retry, true);
  const done = engine.answer(p, "a", "en", now);
  assert.equal(done.finished.correct_first_try, 1);
  assert.equal(done.finished.total, 2);
});

test("reviews start once topics are due", () => {
  const p = emptyProgress();
  const start = new Date();
  engine.startLesson(p, "l3", false);
  finish(p, "a", start);
  assert.equal(engine.startReviews(p, false), false);
  // A day later the topic is due.
  p.concepts.c3.due = new Date(start.getTime() - 1).toISOString();
  assert.equal(engine.startReviews(p, false), true);
  assert.equal(p.session.kind, "review");
});

test("a mock exam asks catalog.exam.size questions without feedback and grades at the end", () => {
  const p = emptyProgress();
  engine.startExam(p, false);
  assert.equal(p.session.questions.length, 4);
  const r = engine.answer(p, "a", "en");
  assert.deepEqual(r.feedback, { recorded: true });
  const end = finish(p);
  assert.equal(end.finished.total, 4);
  assert.equal(end.finished.score, 4);
});

test("progress that mentions removed questions, topics and lessons still works", () => {
  const p = emptyProgress();
  const past = "2026-01-01T00:00:00.000Z";
  p.answered.gone = { correct: true, at: past };
  p.concepts.gone = { level: 2, due: past };
  p.concepts.c1 = { level: 1, due: past };
  p.session = { kind: "review", questions: ["gone", "q1", "gone"], pos: 1, answers: { gone: "a" } };
  engine.fitToCatalog(p);
  assert.deepEqual(p.session, { kind: "review", questions: ["q1"], pos: 0, answers: {} });
  assert.equal(engine.currentStep(p.session, "en").question.id, "q1");
  assert.equal(engine.progress(p, "en").reviews_due, 1);
  assert.equal(engine.startReviews(p, false), true);
  assert.deepEqual(p.session.questions, ["q1"]);
});

test("a session ends when its lesson or all its remaining questions are gone", () => {
  const p = emptyProgress();
  p.session = { kind: "lesson", lesson: "gone", questions: ["q1"], pos: 0, answers: {} };
  engine.fitToCatalog(p);
  assert.equal(p.session, undefined);
  p.session = { kind: "exam", questions: ["q1", "gone"], pos: 1, answers: { q1: "a" } };
  engine.fitToCatalog(p);
  assert.equal(p.session, undefined);
});
