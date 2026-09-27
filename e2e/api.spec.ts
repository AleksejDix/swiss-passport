// REST API /api/v1: the contract the website and the mobile apps rely on, against the real Worker and a local D1.
import { test, expect, type APIRequestContext } from "@playwright/test";
import quiz from "../quiz.json" with { type: "json" };

const CODE = /^[A-Z]+-[A-Z0-9]{4}$/;
const LETTERS = ["a", "b", "c", "d"] as const;
const rightAnswer = (id: string) => quiz.questions.find((q) => q.id === id)!.answer;
const wrongAnswer = (id: string) => LETTERS.find((l) => l !== rightAnswer(id))!;

/** A new learner: their code and the header that carries it. */
async function newLearner(request: APIRequestContext, language = "en") {
  const res = await request.post("/api/v1/learners", { data: { language } });
  expect(res.status()).toBe(201);
  const body = await res.json();
  return { body, headers: { "x-learner-code": body.learner_code as string } };
}

test("POST /learners makes a code and returns the progress of the new learner", async ({ request }) => {
  const { body } = await newLearner(request);
  expect(body.learner_code).toMatch(CODE);
  expect(body.lessons_done).toBe(0);
  expect(body.next_lesson.id).toBe("l01");
  expect(body.lesson_choices.map((c: { id: string }) => c.id)).toContain("l05");
});

test("GET /progress needs a known code and speaks the language asked for", async ({ request }) => {
  expect((await request.get("/api/v1/progress")).status()).toBe(401);
  expect((await request.get("/api/v1/progress", { headers: { "x-learner-code": "BERG-0000" } })).status()).toBe(404);
  const { headers } = await newLearner(request);
  const de = await (await request.get("/api/v1/progress?language=de", { headers })).json();
  expect(de.next_lesson.title).toBe("Name, Symbole und Nationalfeiertag");
  expect((await request.get("/api/v1/progress?language=xx", { headers })).status()).toBe(400);
});

test("a lesson: a wrong answer comes back, the next step comes with each answer, progress knows the open lesson", async ({
  request,
}) => {
  const { headers } = await newLearner(request);
  const start = await (await request.post("/api/v1/lessons", { headers, data: { lesson_id: "l05" } })).json();
  expect(start.lesson.position).toBe("5/37");
  expect(start.explain_first).toBeTruthy();
  expect(start).not.toHaveProperty("question.answer");

  const wrong = await (
    await request.post("/api/v1/answers", { headers, data: { answer: wrongAnswer(start.question.id) } })
  ).json();
  expect(wrong.feedback.correct).toBe(false);
  expect(wrong.feedback.comes_again_later_in_this_round).toBe(true);
  expect(wrong.next.question.id).not.toBe(start.question.id);

  const progress = await (await request.get("/api/v1/progress", { headers })).json();
  expect(progress.unfinished_session.kind).toBe("lesson");
  // Starting again without a lesson continues where the learner stopped.
  const again = await (await request.post("/api/v1/lessons", { headers, data: {} })).json();
  expect(again.continued_unfinished_lesson).toBe(true);
  expect(again.question.id).toBe(wrong.next.question.id);
});

test("picture questions come with the addresses of their pictures", async ({ request }) => {
  const { headers } = await newLearner(request);
  let step = await (await request.post("/api/v1/lessons", { headers, data: { lesson_id: "l01" } })).json();
  let images: Record<string, string> | undefined = step.images;
  for (let i = 0; i < 20 && !images?.a; i++) {
    const r = await (
      await request.post("/api/v1/answers", { headers, data: { answer: rightAnswer(step.question.id) } })
    ).json();
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
  const { headers } = await newLearner(request);
  const reviews = await (await request.post("/api/v1/reviews", { headers })).json();
  expect(reviews.nothing_due).toBe(true);
  const exam = await (await request.post("/api/v1/exams", { headers })).json();
  expect(exam.step).toBe("1/50");
  const r = await (await request.post("/api/v1/answers", { headers, data: { answer: "a" } })).json();
  expect(r.feedback).toEqual({ recorded: true });
});

test("bad requests get clear errors", async ({ request }) => {
  const { headers } = await newLearner(request);
  expect((await request.post("/api/v1/answers", { headers, data: { answer: "a" } })).status()).toBe(409);
  expect((await request.post("/api/v1/answers", { headers, data: { answer: "e" } })).status()).toBe(400);
  expect((await request.post("/api/v1/lessons", { headers, data: { lesson_id: "l99" } })).status()).toBe(400);
  const notJson = await request.post("/api/v1/lessons", { headers, data: "{", failOnStatusCode: false });
  expect(notJson.status()).toBe(400);
  const method = await request.delete("/api/v1/progress", { headers });
  expect(method.status()).toBe(405);
  expect(method.headers()["allow"]).toBe("GET");
  expect((await request.get("/api/v1/unknown")).status()).toBe(404);
  const index = await (await request.get("/api/v1")).json();
  expect(index.version).toBe("v1");
});
