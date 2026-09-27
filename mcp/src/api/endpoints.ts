// The endpoints of /api/v1: each one's method, body and learning action. A new endpoint is a new entry here.
import { z } from "zod";
import { BLOCK_SECONDS, guarded, type Guard } from "../guard.js";
import { LANGUAGES } from "../learning/catalog.js";
import { isLearnerCode, normalizeCode } from "../learning/codes.js";
import { unknownCode } from "../learning/learners.js";
import type { Done, Learner, Learning } from "../learning/learning.js";
import { json, readBody, reply, tooMany } from "./json.js";

/** What every endpoint gets besides the request: the learning actions and the client's limits. */
export interface Context {
  learning: Learning;
  guard?: Guard;
  /** The client's IP address. */
  client: string;
}

export interface Endpoint {
  method: "GET" | "POST";
  handle(request: Request, context: Context): Promise<Response>;
}

const DOCS = "https://github.com/AleksejDix/swiss-passport/blob/main/mcp/API.md";

const language = z.enum(LANGUAGES).optional();
const id = z.string().max(16).optional();
const learnerBody = z.object({ learner_code: z.string().max(32).optional(), language });
const startBody = learnerBody.extend({ voice: z.boolean().optional() });
const lessonBody = startBody.extend({ lesson_id: id });
const answerBody = learnerBody.extend({ answer: z.enum(["a", "b", "c", "d"]), question_id: id });

/** A POST endpoint: its JSON body is read and checked before `handle` runs. */
function post<S extends z.ZodType>(
  schema: S,
  handle: (body: z.infer<S>, context: Context) => Promise<Response>,
): Endpoint {
  return {
    method: "POST",
    async handle(request, context) {
      const body = await readBody(request, schema);
      return body instanceof Response ? body : handle(body, context);
    },
  };
}

/** Runs the action for the learner of the body's code; a code that cannot exist is a 404 without asking the store. */
async function forLearner(
  { learner_code, language }: z.infer<typeof learnerBody>,
  action: (who: Learner) => Promise<Done>,
) {
  if (learner_code === undefined) return action({ language });
  const code = normalizeCode(learner_code);
  if (!isLearnerCode(code)) return { out: unknownCode(learner_code, "by-code") };
  return action({ learner_code: code, language });
}

/** A POST endpoint for the learner named in the body. A wrong or malformed code counts against the client. */
function learnerPost<S extends typeof learnerBody>(
  schema: S,
  action: (learning: Learning, who: Learner, body: z.infer<S>) => Promise<Done>,
): Endpoint {
  return post(schema, async (body, { learning, guard, client }) => {
    const done = await guarded(guard, client, () => forLearner(body, (who) => action(learning, who, body)));
    return done ? reply(done) : tooMany(BLOCK_SECONDS);
  });
}

export const ENDPOINTS = new Map<string, Endpoint>([
  ["", { method: "GET", handle: async () => json({ version: "v1", languages: LANGUAGES, docs: DOCS }) }],
  [
    "/learners",
    post(z.object({ language }), async ({ language }, { learning, guard, client }) => {
      if (guard && !(await guard.newLearner(client))) return tooMany(60);
      return reply(await learning.newLearner(language), 201);
    }),
  ],
  ["/progress", learnerPost(learnerBody, (learning, who) => learning.progress(who))],
  [
    "/lessons",
    learnerPost(lessonBody, (learning, who, { lesson_id, voice }) => learning.startLesson(who, { lesson_id, voice })),
  ],
  ["/reviews", learnerPost(startBody, (learning, who, { voice }) => learning.startReviews(who, { voice }))],
  ["/exams", learnerPost(startBody, (learning, who, { voice }) => learning.startExam(who, { voice }))],
  [
    "/answers",
    learnerPost(answerBody, (learning, who, { answer, question_id }) => learning.answer(who, { answer, question_id })),
  ],
]);
