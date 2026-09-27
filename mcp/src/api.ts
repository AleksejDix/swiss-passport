// REST API for the website (/learn) and the mobile apps: the learning actions of the MCP tools (learning.ts) as
// plain JSON. Versioned under /api/v1/, so app versions in the stores keep working when the API changes later.
// The learner is identified by the header X-Learner-Code (no login); POST /api/v1/learners creates a code.
// Reference with examples: mcp/API.md.
import { z } from "zod";
import { LANGUAGES } from "./catalog.js";
import { engine, type Done, type Learning } from "./learning.js";

export const API_PREFIX = "/api/v1";

const language = z.enum(LANGUAGES).optional();
const voice = z.boolean().optional();
const BODIES = {
  learners: z.object({ language }),
  lessons: z.object({ language, voice, lesson_id: z.string().optional() }),
  start: z.object({ language, voice }),
  answers: z.object({ language, answer: z.enum(["a", "b", "c", "d"]), question_id: z.string().optional() }),
};

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

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
function reply({ out, learnerCode }: Done, status = 200) {
  const images = pictures(out.questionId);
  return json(
    { ...(learnerCode && { learner_code: learnerCode }), ...out.data, ...(images && { images }) },
    out.status ?? status,
  );
}

/** The request body, checked against its schema; undefined body counts as {}. */
async function body<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T> | Response> {
  const text = await request.text();
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
  "/progress": ["GET"],
  "/lessons": ["POST"],
  "/reviews": ["POST"],
  "/exams": ["POST"],
  "/answers": ["POST"],
};

/** Answers a request under /api/v1/. */
export async function handleApi(request: Request, learning: Learning): Promise<Response> {
  const url = new URL(request.url);
  const route = url.pathname.slice(API_PREFIX.length).replace(/\/$/, "");
  const allowed = ROUTES[route];
  if (!url.pathname.startsWith(API_PREFIX) || !allowed) return json({ error: "Not found." }, 404);
  if (!allowed.includes(request.method))
    return json({ error: "Method not allowed." }, 405, { allow: allowed.join(", ") });

  const learner_code = request.headers.get("x-learner-code") ?? undefined;

  switch (route) {
    case "":
      return json({
        version: "v1",
        languages: LANGUAGES,
        docs: "https://github.com/AleksejDix/swiss-passport/blob/main/mcp/API.md",
      });
    case "/learners": {
      const b = await body(request, BODIES.learners);
      if (b instanceof Response) return b;
      // Always a new learner, whatever code the request carries.
      return reply(await learning.progress({ language: b.language }), 201);
    }
    case "/progress": {
      const lang = language.safeParse(url.searchParams.get("language") ?? undefined);
      if (!lang.success) return json({ error: `language must be one of ${LANGUAGES.join(", ")}.` }, 400);
      return reply(await learning.progress({ learner_code, language: lang.data }, false));
    }
    case "/lessons": {
      const b = await body(request, BODIES.lessons);
      if (b instanceof Response) return b;
      const { language: l, ...options } = b;
      return reply(await learning.startLesson({ learner_code, language: l }, options, false));
    }
    case "/reviews":
    case "/exams": {
      const b = await body(request, BODIES.start);
      if (b instanceof Response) return b;
      const who = { learner_code, language: b.language };
      const start = route === "/reviews" ? learning.startReviews : learning.startExam;
      return reply(await start(who, { voice: b.voice }, false));
    }
    default: {
      // "/answers"
      const b = await body(request, BODIES.answers);
      if (b instanceof Response) return b;
      const { language: l, ...options } = b;
      return reply(await learning.answer({ learner_code, language: l }, options, false));
    }
  }
}
