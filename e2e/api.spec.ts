// REST API /api/v1: the contract the website and the mobile apps rely on, against the real Worker and a local D1.
// The limits per client (mcp/src/guard.ts) are off in local development; everything else runs as in production.
import { test, expect, type APIRequestContext } from "@playwright/test";
import quiz from "../quiz.json" with { type: "json" };

const CODE = /^[A-Z]+-[A-Z0-9]{4}$/;
const LETTERS = ["a", "b", "c", "d"] as const;
const rightAnswer = (id: string) => quiz.questions.find((q) => q.id === id)!.answer;
const wrongAnswer = (id: string) => LETTERS.find((l) => l !== rightAnswer(id))!;

/** POST with a JSON body (Playwright sets content-type: application/json). */
const post = (request: APIRequestContext, path: string, data: object = {}) => request.post(`/api/v1${path}`, { data });

/** A new learner and a function that sends their code with every request. */
async function newLearner(request: APIRequestContext, language = "en") {
  const res = await post(request, "/learners", { language });
  expect(res.status()).toBe(201);
  const body = await res.json();
  const as = async (path: string, data: object = {}) =>
    (await post(request, path, { learner_code: body.learner_code, ...data })).json();
  return { body, as };
}

test("POST /learners makes a code and returns the progress of the new learner", async ({ request }) => {
  const { body } = await newLearner(request);
  expect(body.learner_code).toMatch(CODE);
  expect(body.lessons_done).toBe(0);
  expect(body.next_lesson.id).toBe("l01");
  expect(body.lesson_choices.map((c: { id: string }) => c.id)).toContain("l05");
});

test("POST /progress needs a known code and speaks the language asked for", async ({ request }) => {
  expect((await post(request, "/progress")).status()).toBe(401);
  expect((await post(request, "/progress", { learner_code: "BERG-2222" })).status()).toBe(404);
  const { body, as } = await newLearner(request);
  // The code is not case- or space-sensitive.
  const lower = await post(request, "/progress", { learner_code: ` ${body.learner_code.toLowerCase()} ` });
  expect(lower.status()).toBe(200);
  const de = await as("/progress", { language: "de" });
  expect(de.next_lesson.title).toBe("Name, Symbole und Nationalfeiertag");
  expect((await post(request, "/progress", { learner_code: body.learner_code, language: "xx" })).status()).toBe(400);
});

test("a lesson: a wrong answer comes back, the next step comes with each answer, progress knows the open lesson", async ({
  request,
}) => {
  const { as } = await newLearner(request);
  const start = await as("/lessons", { lesson_id: "l05" });
  expect(start.lesson.position).toBe("5/37");
  expect(start.explain_first).toBeTruthy();
  expect(start).not.toHaveProperty("question.answer");

  const wrong = await as("/answers", { answer: wrongAnswer(start.question.id) });
  expect(wrong.feedback.correct).toBe(false);
  expect(wrong.feedback.comes_again_later_in_this_round).toBe(true);
  expect(wrong.next.question.id).not.toBe(start.question.id);

  const progress = await as("/progress");
  expect(progress.unfinished_session.kind).toBe("lesson");
  // Starting again without a lesson continues where the learner stopped.
  const again = await as("/lessons");
  expect(again.continued_unfinished_lesson).toBe(true);
  expect(again.question.id).toBe(wrong.next.question.id);
});

test("picture questions come with the paths of their pictures", async ({ request }) => {
  const { as } = await newLearner(request);
  let step = await as("/lessons", { lesson_id: "l01" });
  let images: Record<string, string> | undefined = step.images;
  for (let i = 0; i < 20 && !images?.a; i++) {
    const r = await as("/answers", { answer: rightAnswer(step.question.id) });
    step = r.next;
    images = r.images;
  }
  expect(Object.keys(images!)).toEqual(["a", "b", "c", "d"]);
  expect(images!.a).toMatch(/^\/images\/.+\.png$/);
  const picture = await request.get(images!.a);
  expect(picture.status()).toBe(200);
  expect(picture.headers()["content-type"]).toContain("image/");
});

test("reviews and mock exams", async ({ request }) => {
  const { as } = await newLearner(request);
  expect((await as("/reviews")).nothing_due).toBe(true);
  const exam = await as("/exams");
  expect(exam.step).toBe("1/50");
  expect((await as("/answers", { answer: "a" })).feedback).toEqual({ recorded: true });
});

test("bad requests get clear errors", async ({ request }) => {
  const { body, as } = await newLearner(request);
  const code = body.learner_code;
  expect((await post(request, "/answers", { learner_code: code, answer: "a" })).status()).toBe(409);
  expect((await post(request, "/answers", { learner_code: code, answer: "e" })).status()).toBe(400);
  expect((await post(request, "/lessons", { learner_code: code, lesson_id: "l99" })).status()).toBe(400);
  expect((await post(request, "/lessons", { learner_code: "x".repeat(40) })).status()).toBe(400);
  expect((await post(request, "/progress", { learner_code: "DROP TABLE-1234" })).status()).toBe(404);
  const notJson = await request.post("/api/v1/lessons", {
    headers: { "content-type": "application/json" },
    data: "{",
  });
  expect(notJson.status()).toBe(400);
  // Only JSON: a form post from another website is refused.
  const form = await request.post("/api/v1/learners", { form: { language: "en" } });
  expect(form.status()).toBe(415);
  const big = await request.post("/api/v1/progress", {
    headers: { "content-type": "application/json" },
    data: JSON.stringify({ learner_code: code, padding: "x".repeat(9000) }),
  });
  expect(big.status()).toBe(413);
  const get = await request.get("/api/v1/progress");
  expect(get.status()).toBe(405);
  expect(get.headers()["allow"]).toBe("POST");
  expect((await request.get("/api/v1/unknown")).status()).toBe(404);
  expect((await as("/progress")).lessons_done).toBe(0);
});

test("every answer is JSON that browsers must not sniff, frame or cache", async ({ request }) => {
  const index = await request.get("/api/v1");
  expect((await index.json()).version).toBe("v1");
  for (const res of [index, await post(request, "/progress")]) {
    const h = res.headers();
    expect(h["content-type"]).toContain("application/json");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["cache-control"]).toBe("no-store");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["access-control-allow-origin"]).toBeUndefined();
  }
});
