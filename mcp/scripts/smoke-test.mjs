// End-to-end check: starts the server over stdio and runs through a learning session step by step.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const progressFile = join(mkdtempSync(join(tmpdir(), "spz-")), "progress.json");
const client = new Client({ name: "smoke-test", version: "0" });
await client.connect(
  new StdioClientTransport({
    command: "node",
    args: [process.env.SERVER_ENTRY || "dist/index.js"],
    env: { ...process.env, PROGRESS_FILE: progressFile },
  }),
);

let lastStructured;
const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  lastStructured = r.structuredContent;
  return { json: JSON.parse(r.content[0].text), images: r.content.filter((c) => c.type === "image").length };
};
const assert = (ok, msg) => {
  if (!ok) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
};
const quiz = JSON.parse(readFileSync(new URL("../data/quiz.json", import.meta.url), "utf8"));
const key = Object.fromEntries(quiz.questions.map((q) => [q.id, q.answer]));
const wrongFor = (qid) => ["a", "b", "c", "d"].find((x) => x !== key[qid]);

const tools = (await client.listTools()).tools.map((t) => t.name);
assert(tools.length === 5, `5 tools: ${tools.join(", ")}`);

const toolList = (await client.listTools()).tools;
assert(
  toolList.every((t) => t.annotations?.destructiveHint === false && t.annotations?.openWorldHint === false),
  "all tools declared non-destructive and closed-world",
);
assert(
  toolList.filter((t) => t._meta?.ui?.resourceUri === "ui://swiss-passport/card-v7.html").length === 4,
  "4 question tools show the quiz card",
);
assert(
  toolList.find((t) => t.name === "answer")._meta.ui.visibility.includes("app"),
  "the quiz card may call answer itself",
);
const card = await client.readResource({ uri: "ui://swiss-passport/card-v7.html" });
assert(
  card.contents[0].mimeType === "text/html;profile=mcp-app" && card.contents[0].text.includes('<div id="root">'),
  "quiz card resource readable",
);
assert(
  card.contents[0]._meta?.ui?.csp && card.contents[0]._meta["openai/widgetDomain"] === "https://swiss-passport.com",
  "quiz card declares its CSP and domain",
);

let { json: p } = await call("get_progress", { language: "en" });
assert(p.lessons_done === 0 && p.next_lesson.id === "l01", "fresh learner: l01 recommended");
assert(
  p.lesson_choices.map((c) => c.id).join() === "l01,l05,l16,l22,l27,l34",
  "fresh learner: one lesson per open unit to choose from (unit 3 needs unit 2 first)",
);

let { json: step } = await call("start_lesson", { language: "en" });
assert(
  step.lesson?.position === "1/37" && step.explain_first && step.step === "1/9",
  "lesson starts with one concept and one question",
);
assert(!("questions" in step) && !JSON.stringify(step).includes('"answer"'), "only one question, no answer leaked");
assert(step.question.german?.question, "German original included");
assert(!step.voice_instructions, "no voice instructions in a text session");

// ChatGPT (it sends "openai/..." keys in _meta): the card's texts go to the card only, the model gets which step it is.
const viaChatGPT = await client.callTool({
  name: "start_lesson",
  arguments: {},
  _meta: { "openai/userAgent": "smoke-test" },
});
const brief = JSON.parse(viaChatGPT.content[0].text);
assert(
  brief.shown_on_card &&
    typeof brief.question === "string" &&
    !JSON.stringify(brief).includes('"options"') &&
    !JSON.stringify(brief).includes('"id"') &&
    !brief.explain_first &&
    viaChatGPT.structuredContent.shown_on_card,
  "ChatGPT: the model gets the step without the card's texts",
);
assert(
  viaChatGPT._meta?.card?.data?.question?.options?.a &&
    viaChatGPT._meta.card.data.explain_first &&
    viaChatGPT._meta.card.labels,
  "ChatGPT: the card gets the whole step in _meta",
);
const click = await client.callTool({
  name: "answer",
  arguments: { answer: "a", question_id: "q000" },
  _meta: { "openai/userAgent": "smoke-test" },
});
assert(
  click.structuredContent?.data?.question?.options && !click._meta,
  "ChatGPT: a click on the card gets the whole step in structuredContent",
);

// Lesson: the first question wrong. It must come back at the end until answered correctly.
let r,
  concepts = 1,
  images,
  answered = 0;
const firstQ = step.question.id;
({ json: r } = await call("answer", { answer: "a", question_id: "q000" }));
assert(
  r.question_already_answered && r.question.id === firstQ && r.step === "1/9",
  "a card showing an old question answers nothing and gets the current step",
);
for (;;) {
  const qid = step.question.id;
  const isFirst = answered === 0;
  ({ json: r, images } = await call("answer", { answer: isFirst ? wrongFor(qid) : key[qid], question_id: qid }));
  answered++;
  assert(r.feedback.correct === !isFirst && r.feedback.why, `answer ${answered} (${qid}) checked with explanation`);
  if (isFirst) assert(r.feedback.comes_again_later_in_this_round, "wrong answer is announced to come again");
  if (isFirst) {
    const { json: again } = await call("start_lesson", {});
    assert(
      again.continued_unfinished_lesson && again.step === r.next.step && again.question.id === r.next.question.id,
      "start_lesson without lesson_id continues the unfinished lesson",
    );
  }
  if (!r.next) break;
  step = r.next;
  if (step.explain_first) concepts++;
  if (step.question.id === "q055")
    assert(
      images === 4 && lastStructured.images.a?.startsWith("data:image/png;base64,"),
      "flag images sent with q055 (to model and card)",
    );
}
assert(
  answered === 10 && step.question.id === firstQ && step.retry && step.step === "10/10",
  "wrong question repeated as step 10/10, marked retry",
);
assert(concepts === 3, "each concept explained once, not again on the retry");
assert(
  r.finished?.lesson === "done" && r.finished.correct_first_try === 8 && r.finished.total === 9,
  "lesson summary: 8 of 9 correct at the first try",
);

({ json: r } = await call("answer", { answer: "a" }));
assert(r.error, "answer without active session is rejected");

({ json: step } = await call("start_reviews", {}));
assert(step.nothing_due, "nothing due right after the lesson");

// Travel one day ahead: all three concepts of the lesson are due.
const prog = JSON.parse(readFileSync(progressFile, "utf8"));
for (const c of Object.values(prog.concepts)) c.due = new Date(Date.now() - 1000).toISOString();
writeFileSync(progressFile, JSON.stringify(prog));

({ json: step } = await call("start_reviews", {}));
assert(step.step === "1/3" && !step.explain_first, "next day: 3 concepts to review");
const reviewFirst = step.question.id;
({ json: r } = await call("answer", { answer: wrongFor(reviewFirst) }));
step = r.next;
({ json: r } = await call("answer", { answer: key[step.question.id] }));
step = r.next;
({ json: r } = await call("answer", { answer: key[step.question.id] }));
assert(
  r.next?.question.id === reviewFirst && r.next.retry && r.next.step === "4/4",
  "failed review question repeated at the end",
);
({ json: r } = await call("answer", { answer: key[reviewFirst] }));
assert(
  r.finished?.review === "done" && r.finished.correct_first_try === 2 && !r.feedback.review,
  "review round done; the retry does not change the schedule",
);
const after = JSON.parse(readFileSync(progressFile, "utf8")).concepts;
const failedConcept = Object.keys(after).find(
  (c) => new Date(after[c].due) - Date.now() < 1.5 * 86400000 && new Date(after[c].due) > Date.now(),
);
assert(failedConcept, "the failed concept comes back tomorrow");

({ json: step } = await call("start_mock_exam", { language: "ru" }));
assert(step.step === "1/50", "mock exam starts at 1/50");
const seen = new Set();
for (let i = 0; i < 50; i++) {
  seen.add(step.question.id);
  ({ json: r } = await call("answer", { answer: i < 40 ? key[step.question.id] : wrongFor(step.question.id) }));
  if (!r.feedback.recorded || "correct" in r.feedback) assert(false, `exam gave feedback at question ${i + 1}`);
  if (i < 49) step = r.next;
}
assert(
  seen.size === 50 && r.finished.score === 40 && r.finished.mistakes.length === 10,
  "mock exam: 50 distinct questions, no feedback, graded 40/50",
);

({ json: p } = await call("get_progress", {}));
assert(
  p.lessons_done === 1 && p.next_lesson.id === "l05" && !p.unfinished_session,
  "progress saved: next lesson l05, from another unit",
);
assert(p.lesson_choices.at(-1).id === "l02", "the unit just studied comes last");

// Voice: picture questions are left out, and the lesson still counts as done.
const pictureQs = new Set(quiz.questions.filter((q) => q.image || q.options.some((o) => o.image)).map((q) => q.id));
({ json: step } = await call("start_lesson", { lesson_id: "l34", voice: true }));
assert(step.voice_instructions?.includes("answer tool"), "voice step tells the model to send answers with answer");
let voiceQs = [step.question.id];
for (;;) {
  ({ json: r } = await call("answer", { answer: key[step.question.id] }));
  if (!r.next) break;
  if (!r.voice_instructions) assert(false, "voice instructions missing after an answer");
  step = r.next;
  voiceQs.push(step.question.id);
}
assert(
  voiceQs.length === 7 && !voiceQs.some((q) => pictureQs.has(q)),
  "voice lesson l34: 7 questions, no pictures (q110, q289 skipped)",
);
({ json: step } = await call("start_mock_exam", { voice: true }));
const examQs = [step.question.id];
for (let i = 0; i < 49; i++) {
  ({ json: r } = await call("answer", { answer: "a" }));
  step = r.next;
  examQs.push(step.question.id);
}
assert(!examQs.some((q) => pictureQs.has(q)), "voice mock exam has no picture questions");

await client.close();
console.log("all checks passed");
