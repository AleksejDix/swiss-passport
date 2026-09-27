// The review schedule: topics that finish, what a mistake does, the learner's "sooner / later", points.
// One lesson with one topic of two questions (right answer "a"), in a catalog built per test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEngine, emptyProgress, validateCatalog } from "../dist/index.js";

const DAY = 24 * 60 * 60 * 1000;
const opts = ["a", "b"].map((id) => ({ id }));
const course = (extra = {}, questions = [{}, {}]) => ({
  exam: { name: "a test course", size: 2, pass_mark: "not set" },
  languages: ["en"],
  questions: questions.map((q, i) => ({
    id: `q${i + 1}`,
    category: "c",
    level: "l",
    options: opts,
    answer: "a",
    ...q,
  })),
  curriculum: {
    units: [{ id: "u1", lessons: ["l1"] }],
    lessons: [{ id: "l1", unit: "u1", concepts: ["t1"] }],
    concepts: [{ id: "t1", lesson: "l1", questions: questions.map((_, i) => `q${i + 1}`), sources: [] }],
  },
  texts: {
    en: {
      title: "Course",
      categories: { c: "C" },
      levels: { l: "L" },
      units: { u1: { title: "Unit" } },
      lessons: { l1: { title: "Lesson one" } },
      concepts: { t1: { title: "Topic", intro: [], key_terms: [] } },
      questions: Object.fromEntries(
        questions.map((_, i) => [`q${i + 1}`, { question: "?", options: { a: "A", b: "B" } }]),
      ),
    },
  },
  ...extra,
});

/** A review round of the topic, due now, answered with the letter. Returns the feedback. */
function review(engine, p, letter) {
  p.concepts.t1.due = new Date(Date.now() - 1000).toISOString();
  assert.equal(engine.startReviews(p, false), true);
  const r = engine.answer(p, letter, "en");
  while (p.session) engine.answer(p, "a", "en");
  return r.feedback;
}

test("by default a topic finishes after reviews at 2, 7, 21 and 60 days and is never due again", () => {
  const engine = createEngine(course());
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  const days = (f) => Math.round((new Date(f.review.next_review).getTime() - Date.now()) / DAY);
  assert.equal(days(engine.answer(p, "a", "en").feedback), 2);
  engine.answer(p, "a", "en");
  assert.deepEqual([review(engine, p, "a"), review(engine, p, "a"), review(engine, p, "a")].map(days), [7, 21, 60]);
  const last = review(engine, p, "a");
  assert.deepEqual(last.review, { level: 4, max_level: 4, finished: true });
  p.concepts.t1.due = new Date(Date.now() - 1000).toISOString();
  assert.equal(engine.startReviews(p, false), false);
  assert.equal(engine.progress(p, "en").reviews_due, 0);
  assert.equal(engine.progress(p, "en").readiness_percent, 100);
});

test("by default a mistake halves the level, and the topic waits that level's delay", () => {
  const engine = createEngine(course());
  const p = emptyProgress();
  p.concepts.t1 = { level: 4, due: new Date().toISOString() };
  const f = review(engine, p, "b");
  assert.equal(f.review.level, 2);
  assert.equal(Math.round((new Date(f.review.next_review).getTime() - Date.now()) / DAY), 7);
});

test("a course can keep topics coming back and move one step back after a mistake, due the next day", () => {
  const engine = createEngine(course({ review: { days: [1, 3, 7, 14, 30], finish: false, mistake: "step" } }));
  const p = emptyProgress();
  p.concepts.t1 = { level: 5, due: new Date().toISOString() };
  assert.deepEqual(Object.keys(review(engine, p, "a").review), ["level", "max_level", "next_review"]);
  assert.equal(p.concepts.t1.level, 5);
  const f = review(engine, p, "b");
  assert.equal(f.review.level, 4);
  assert.equal(Math.round((new Date(f.review.next_review).getTime() - Date.now()) / DAY), 1);
});

test("a wrong review answer names the lesson to revisit; a wrong lesson answer does not", () => {
  const engine = createEngine(course());
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  assert.equal(engine.answer(p, "b", "en").feedback.revisit_lesson, undefined);
  while (p.session) engine.answer(p, "a", "en");
  assert.deepEqual(review(engine, p, "b").revisit_lesson, { id: "l1", title: "Lesson one" });
});

test("the learner can move a topic sooner or later, up to finishing it", () => {
  const engine = createEngine(course());
  const p = emptyProgress();
  assert.equal(engine.adjust(p, "q1", "later"), undefined);
  p.concepts.t1 = { level: 3, due: new Date().toISOString() };
  assert.equal(engine.adjust(p, "q1", "sooner").level, 2);
  assert.equal(engine.adjust(p, "q2", "later").level, 3);
  engine.adjust(p, "q1", "later");
  assert.deepEqual(engine.adjust(p, "q1", "later"), { level: 4, max_level: 4, finished: true });
  assert.equal(engine.adjust(p, "q1", "sooner").finished, undefined);
});

test("points: results count them where questions have points, and nowhere else", () => {
  const plain = createEngine(course());
  const p0 = emptyProgress();
  plain.startLesson(p0, "l1", false);
  plain.answer(p0, "a", "en");
  assert.equal(plain.answer(p0, "a", "en").finished.points, undefined);

  const engine = createEngine(course({}, [{ points: 3 }, { points: 1 }]));
  const p = emptyProgress();
  engine.startLesson(p, "l1", false);
  engine.answer(p, "a", "en");
  engine.answer(p, "b", "en");
  const done = engine.answer(p, "a", "en").finished;
  assert.deepEqual([done.points, done.max_points], [3, 4]);

  engine.startExam(p, false);
  let end;
  while (p.session) end = engine.answer(p, p.session.questions[p.session.pos] === "q1" ? "b" : "a", "en");
  assert.deepEqual([end.finished.points, end.finished.max_points], [1, 4]);
  assert.deepEqual([p.exams[0].points, p.exams[0].max_points], [1, 4]);
});

test("validateCatalog checks points and the review schedule", () => {
  assert.deepEqual(validateCatalog(course({ review: { days: [2, 7] } }, [{ points: 2 }, {}])), []);
  assert.deepEqual(validateCatalog(course({ review: { days: [] } }, [{ points: 0 }, {}])), [
    "question q1: points must be more than 0",
    "review.days must list at least one delay, each more than 0 days",
  ]);
});
