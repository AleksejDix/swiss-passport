// REST API for the website (/learn) and the mobile apps: the learning actions of the MCP tools (learning.ts) as
// plain JSON. Versioned under /api/v1/, so app versions in the stores keep working when the API changes later.
// Reference with examples: mcp/API.md.
//
// The learner code travels in the JSON body, never in the URL or a header: Cloudflare's Workers Logs keep the URL
// and every request header for 3 days, and the privacy policy says the logs hold no learner code.
// Hardening: JSON only (415), bodies up to 8 KB (413), every field checked (400), wrong learner codes and new
// learners limited per client (429), no caching, headers that stop browsers from sniffing or framing the JSON.
import { z } from "zod";
import { LANGUAGES } from "./catalog.js";
import { engine, type Done, type Learner, type Learning } from "./learning.js";
import { normalizeCode } from "./store.js";

export const API_PREFIX = "/api/v1";
const MAX_BODY = 8 * 1024;
// newLearnerCode (store.ts): a word, a hyphen and four characters without 0, 1, I and O.
const CODE = /^[A-Z]{3,8}-[2-9A-HJ-NP-Z]{4}$/;

/** Limits per client (IP address). Missing in local development and tests. */
export interface Guard {
  /** false: this client made too many new learners in the last minute. */
  newLearner(ip: string): Promise<boolean>;
  /** true: this client sent too many wrong learner codes and has to wait. */
  blocked(ip: string): Promise<boolean>;
  /** Counts a wrong learner code. */
  wrongCode(ip: string): Promise<void>;
}

const language = z.enum(LANGUAGES).optional();
const voice = z.boolean().optional();
const learner_code = z.string().max(32).optional();
const id = z.string().max(16).optional();
const BODIES = {
  learners: z.object({ language }),
  progress: z.object({ learner_code, language }),
  lessons: z.object({ learner_code, language, voice, lesson_id: id }),
  start: z.object({ learner_code, language, voice }),
  answers: z.object({ learner_code, language, answer: z.enum(["a", "b", "c", "d"]), question_id: id }),
};

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
};
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...headers } });
const tooMany = () => json({ error: "Too many requests. Try again later." }, 429, { "retry-after": "60" });

/**
 * Paths of a question's pictures: { question?, a?, b?, c?, d? }. They are static files of the same site, as paths
 * from its root (/images/...): the website uses them as they are, an app puts its server address in front.
 */
function pictures(questionId: string | undefined) {
  const q = questionId ? engine.question(questionId) : undefined;
  if (!q) return undefined;
  const files: [string, string][] = [
    ...(q.image ? [["question", q.image] as [string, string]] : []),
    ...q.options.filter((o) => o.image).map((o) => [o.id, o.image!] as [string, string]),
  ];
  return files.length ? Object.fromEntries(files.map(([key, file]) => [key, `/${file}`])) : undefined;
}

/** The JSON answer for an action: the learner code, its data, the pictures of the step it shows, and its status. */
function reply({ out, learnerCode }: Pick<Done, "out" | "learnerCode">, status = 200) {
  const images = pictures(out.questionId);
  return json(
    { ...(learnerCode && { learner_code: learnerCode }), ...out.data, ...(images && { images }) },
    out.status ?? status,
  );
}

/** The request body: JSON of at most 8 KB, checked against its schema. An empty body counts as {}. */
async function body<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T> | Response> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json"))
    return json({ error: "Send JSON with content-type: application/json." }, 415);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return json({ error: "Body too large." }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "Body too large." }, 413);
  let value: unknown = {};
  if (text.trim()) {
    try {
      value = JSON.parse(text);
    } catch {
      return json({ error: "The body is not valid JSON." }, 400);
    }
  }
  const parsed = schema.safeParse(value);
  return parsed.success
    ? parsed.data
    : json(
        { error: "Invalid request.", issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
        400,
      );
}

const ROUTES: Record<string, string[]> = {
  "": ["GET"],
  "/learners": ["POST"],
  "/progress": ["POST"],
  "/lessons": ["POST"],
  "/reviews": ["POST"],
  "/exams": ["POST"],
  "/answers": ["POST"],
};

/** Answers a request under /api/v1/. */
export async function handleApi(request: Request, learning: Learning, guard?: Guard): Promise<Response> {
  try {
    return await route(request, learning, guard);
  } catch (error) {
    // Only the message: never the request, which may carry a learner code.
    console.error("API error:", error instanceof Error ? error.message : String(error));
    return json({ error: "Something went wrong. Try again." }, 500);
  }
}

async function route(request: Request, learning: Learning, guard?: Guard): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.slice(API_PREFIX.length).replace(/\/$/, "");
  const allowed = ROUTES[path];
  if (!url.pathname.startsWith(API_PREFIX) || !allowed) return json({ error: "Not found." }, 404);
  if (!allowed.includes(request.method))
    return json({ error: "Method not allowed." }, 405, { allow: allowed.join(", ") });

  if (path === "")
    return json({
      version: "v1",
      languages: LANGUAGES,
      docs: "https://github.com/AleksejDix/swiss-passport/blob/main/mcp/API.md",
    });

  const ip = request.headers.get("cf-connecting-ip") ?? "local";

  if (path === "/learners") {
    const b = await body(request, BODIES.learners);
    if (b instanceof Response) return b;
    if (guard && !(await guard.newLearner(ip))) return tooMany();
    return reply(await learning.progress({ language: b.language }), 201);
  }

  /** Runs an action for the learner named in the body. A wrong or malformed code counts against the client. */
  async function forLearner(
    b: { learner_code?: string; language?: Learner["language"] },
    action: (who: Learner) => Promise<Done>,
  ) {
    if (guard && (await guard.blocked(ip))) return tooMany();
    const code = b.learner_code === undefined ? undefined : normalizeCode(b.learner_code);
    const done =
      code !== undefined && !CODE.test(code)
        ? { out: { data: { error: `Unknown learner code "${b.learner_code}".` }, status: 404 } }
        : await action({ learner_code: code, language: b.language });
    if (done.out.status === 404) await guard?.wrongCode(ip);
    return reply(done);
  }

  switch (path) {
    case "/progress": {
      const b = await body(request, BODIES.progress);
      return b instanceof Response ? b : forLearner(b, (who) => learning.progress(who, false));
    }
    case "/lessons": {
      const b = await body(request, BODIES.lessons);
      if (b instanceof Response) return b;
      return forLearner(b, (who) => learning.startLesson(who, { lesson_id: b.lesson_id, voice: b.voice }, false));
    }
    case "/reviews":
    case "/exams": {
      const b = await body(request, BODIES.start);
      if (b instanceof Response) return b;
      const start = path === "/reviews" ? learning.startReviews : learning.startExam;
      return forLearner(b, (who) => start(who, { voice: b.voice }, false));
    }
    default: {
      // "/answers"
      const b = await body(request, BODIES.answers);
      if (b instanceof Response) return b;
      return forLearner(b, (who) => learning.answer(who, { answer: b.answer, question_id: b.question_id }, false));
    }
  }
}
