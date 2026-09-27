// JSON in and out of the REST API: the request body read and checked, and every answer with headers that stop
// browsers from sniffing, framing or caching it.
import type { z } from "zod";
import type { Done } from "../learning/learning.js";
import { questionPictures } from "../learning/pictures.js";

const MAX_BODY = 8 * 1024;
const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
};

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...headers } });

export const error = (message: string, status: number, headers?: Record<string, string>) =>
  json({ error: message }, status, headers);

/** 429 with the seconds to wait: a minute for new learners, the whole block after too many wrong codes. */
export const tooMany = (seconds: number) =>
  error("Too many requests. Try again later.", 429, { "retry-after": String(seconds) });

/**
 * Paths of a question's pictures: { question?, a?, b?, c?, d? }. They are static files of the same site, as paths
 * from its root (/images/...): the website uses them as they are, an app puts its server address in front.
 */
function picturePaths(questionId: string | undefined) {
  const pictures = questionPictures(questionId);
  return pictures.length ? Object.fromEntries(pictures.map(({ key, file }) => [key, `/${file}`])) : undefined;
}

/** The JSON answer for an action: the learner code, its data, the pictures of the step it shows, and its status. */
export function reply({ out, learnerCode }: Pick<Done, "out" | "learnerCode">, status = 200) {
  const images = picturePaths(out.questionId);
  return json(
    { ...(learnerCode && { learner_code: learnerCode }), ...out.data, ...(images && { images }) },
    out.status ?? status,
  );
}

const isJson = (request: Request) =>
  (request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");

/** The body as text, or undefined when it is larger than allowed (announced or real). */
async function text(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return undefined;
  const body = await request.text();
  return body.length > MAX_BODY ? undefined : body;
}

/** The parsed JSON in `value`, or undefined when it is not JSON. An empty body counts as {}. */
function parse(body: string): { value: unknown } | undefined {
  if (!body.trim()) return { value: {} };
  try {
    return { value: JSON.parse(body) };
  } catch {
    return undefined;
  }
}

/** The request body: JSON of at most 8 KB, checked against its schema. Otherwise the error answer. */
export async function readBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T> | Response> {
  if (!isJson(request)) return error("Send JSON with content-type: application/json.", 415);
  const body = await text(request);
  if (body === undefined) return error("Body too large.", 413);
  const parsed = parse(body);
  if (!parsed) return error("The body is not valid JSON.", 400);
  const checked = schema.safeParse(parsed.value);
  if (checked.success) return checked.data;
  const issues = checked.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  return json({ error: "Invalid request.", issues }, 400);
}
