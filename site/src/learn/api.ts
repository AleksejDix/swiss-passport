// The REST API /api/v1 (mcp/API.md): the same learning actions as the MCP tools of the AI apps, so progress is the
// same everywhere. Every request is a POST with JSON; the learner code travels in the body, never in the address.
/** The four options of a question in API v1 (mcp/API.md: answer "a"…"d"). */
export type Letter = "a" | "b" | "c" | "d";
export const LETTERS: Letter[] = ["a", "b", "c", "d"];

/** Pictures of a step: the question and its options, as paths from the site root. */
export type Images = Partial<Record<Letter | "question", string>>;

export interface LessonChoice {
  id: string;
  title: string;
  unit: string;
}

export interface Progress {
  learner_code: string;
  lessons_done: number;
  lessons_total: number;
  lesson_choices: LessonChoice[];
  reviews_due: number;
  readiness_by_category: { category: string; percent: number }[];
  last_exams: { at: string; score: number; total: number }[];
}

export interface Concept {
  title: string;
  intro: string[];
  key_terms: { term: string; definition: string }[];
  mnemonic?: string;
}

export interface Step {
  step: string;
  lesson?: { title: string; unit: string; position: string };
  explain_first?: Concept;
  retry?: boolean;
  concept: string;
  question: {
    id?: string;
    question: string;
    options: Record<Letter, string>;
    german?: { question: string; options: Record<Letter, string> };
    image?: string;
    option_images?: unknown;
  };
}

export interface Feedback {
  correct: boolean;
  correct_answer: Letter;
  correct_answer_text: string;
  correct_answer_german?: string;
  why: string;
  about_your_answer?: string;
  note?: string;
  comes_again_later_in_this_round?: boolean;
  sources?: string[];
}

export interface LessonFinished {
  lesson?: string;
  correct_first_try: number;
  total: number;
  reviews_due: number;
  next_lesson?: string;
}

export interface ExamFinished {
  score: number;
  total: number;
  mistakes: {
    question: string;
    your_answer: Letter;
    correct_answer: Letter;
    correct_answer_text: string;
    why: string;
  }[];
}

export interface Answered {
  feedback: Feedback;
  next?: Step;
  finished?: LessonFinished & ExamFinished;
}

/** A response: the data of the action, or { error } for a learner code the server does not know. */
export type Result<T> = T & { learner_code?: string; error?: string; message?: string };

// The REST endpoint of each learning action: the same actions as the MCP tools of the AI apps (mcp/src/learning/).
export const ROUTES = {
  get_progress: "/progress",
  start_lesson: "/lessons",
  start_reviews: "/reviews",
  start_mock_exam: "/exams",
  answer: "/answers",
} as const;
export type Action = keyof typeof ROUTES;

/**
 * One request to the API, always JSON by POST. Errors such as an unknown code (404) come back as JSON with "error";
 * only outages throw.
 */
export async function request(path: string, body: object): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/v1${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status >= 500 || !res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
