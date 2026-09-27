// WebMCP: the same learning for an AI agent in the browser. Chrome offers document.modelContext (behind a flag or in
// its origin trial); elsewhere nothing happens. Every tool operates this page, so the learner sees each step the
// agent takes.
import { learn } from "./learn.svelte.ts";
import { LETTERS, type Letter, type Step } from "./api.ts";

/** A step as the agent receives it: the question and options in the learner's language and in German. */
const stepForAgent = (step: Step) => ({
  mode: learn.kind,
  step: step.step,
  ...(step.lesson && { lesson: step.lesson.title }),
  ...(learn.kind !== "exam" && { topic: step.concept }),
  ...(step.explain_first && { explain_first: step.explain_first }),
  ...(step.retry && { retry: "The learner got this question wrong earlier in this round." }),
  question: step.question.question,
  options: step.question.options,
  ...(step.question.german && { german: step.question.german }),
  ...(Boolean(step.question.image || step.question.option_images) && {
    pictures: "The question has pictures, shown on the page.",
  }),
});

const NO_QUESTION = "There is no open question on the page. Start a lesson, reviews or a mock exam first.";

/** The step on the screen, and its feedback once answered. */
const current = () => (learn.screen.name === "step" ? learn.screen : undefined);

interface Tool {
  name: string;
  title: string;
  description: string;
  annotations?: object;
  inputSchema?: object;
  execute(input: Record<string, unknown>): Promise<unknown>;
}

const START_TOOLS: [name: "start_lesson" | "start_reviews" | "start_mock_exam", title: string, description: string][] =
  [
    [
      "start_lesson",
      "Start a lesson",
      "Opens a lesson on the page and returns its first question. Offer the learner the lesson_choices from get_progress and pass the chosen lesson_id; without it the recommended lesson opens. A step with explain_first introduces a new topic: explain it briefly before the question.",
    ],
    ["start_reviews", "Start reviews", "Opens the reviews that are due on the page and returns the first question."],
    [
      "start_mock_exam",
      "Start a mock exam",
      "Starts a mock exam on the page: 50 random official questions without feedback until the end, like the real test. Returns the first question.",
    ],
  ];

const TOOLS: Tool[] = [
  {
    name: "get_progress",
    title: "Learning progress",
    description:
      "Returns the learner's progress: lessons done, reviews due, an unfinished round, readiness per topic and recent mock exams. Does not change the page.",
    annotations: { readOnlyHint: true },
    async execute() {
      const { data } = await learn.call<Record<string, unknown>>("get_progress");
      const { learner_code: _code, new_learner_code: _new, ...progress } = data;
      return progress;
    },
  },
  ...START_TOOLS.map(([name, title, description]): Tool => ({
    name,
    title,
    description,
    ...(name === "start_lesson" && {
      inputSchema: {
        type: "object",
        properties: {
          lesson_id: { type: "string", description: "A lesson from lesson_choices of get_progress, e.g. l05." },
        },
      },
    }),
    async execute({ lesson_id }) {
      const data = await learn.start(name, lesson_id ? { lesson_id } : {});
      if (!data) return { error: learn.t.error };
      return data.question ? stepForAgent(data) : { message: data.message };
    },
  })),
  {
    name: "answer_question",
    title: "Answer the question",
    description:
      "Submits the learner's answer to the question on the page. In lessons and reviews it returns whether the answer is right and why, as the page shows it; call next_question to go on. In a mock exam it returns the next question, or the result after the last one.",
    inputSchema: {
      type: "object",
      properties: {
        answer: { type: "string", enum: LETTERS, description: "The letter the learner chose." },
      },
      required: ["answer"],
    },
    async execute({ answer }) {
      if (!LETTERS.includes(answer as Letter)) return { error: "answer must be a, b, c or d." };
      const screen = current();
      if (!screen || screen.answered)
        return { error: screen?.answered ? "This question is answered. Call next_question." : NO_QUESTION };
      const exam = learn.kind === "exam";
      const data = await learn.answer(answer as Letter);
      if (!data?.feedback) return { error: learn.t.error };
      if (exam) return data.next ? { recorded: true, next: stepForAgent(data.next) } : { exam_finished: data.finished };
      return {
        ...data.feedback,
        then: data.next
          ? "Call next_question when the learner is ready."
          : "Round finished: call next_question for the summary.",
      };
    },
  },
  {
    name: "next_question",
    title: "Next question",
    description:
      "After the feedback, goes on to the next question on the page, or to the summary at the end of the round.",
    async execute() {
      if (!learn.waiting) return { error: current() ? "Answer the question on the page first." : NO_QUESTION };
      learn.proceed();
      const screen = learn.screen;
      if (screen.name === "step") return stepForAgent(screen.step);
      return { round_finished: screen.name === "summary" ? screen.finished : undefined };
    },
  },
  {
    name: "set_language",
    title: "Change the language",
    description:
      "Switches the page to the learner's language and shows the overview. The German wording of the real test stays visible next to it.",
    get inputSchema() {
      return {
        type: "object",
        properties: {
          language: { type: "string", enum: learn.languages, description: learn.languages.join(", ") },
        },
        required: ["language"],
      };
    },
    async execute({ language }) {
      if (typeof language !== "string" || !learn.languages.includes(language))
        return { error: `language must be one of ${learn.languages.join(", ")}.` };
      await learn.setLang(language);
      return { language: learn.texts[language].name };
    },
  },
];

interface ModelContext {
  registerTool?(tool: object): unknown;
}

/** Offers the tools to an agent in the browser, where the browser supports it. */
export function registerAgentTools() {
  const context =
    (document as Document & { modelContext?: ModelContext }).modelContext ??
    (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  if (!context?.registerTool) return;
  for (const { execute, inputSchema = { type: "object", properties: {} }, ...tool } of TOOLS) {
    // Tools return text; the agent gets JSON it can read, also when the server cannot be reached.
    const run = async (input?: Record<string, unknown>) =>
      JSON.stringify(await execute(input ?? {}).catch(() => ({ error: learn.t.error })));
    try {
      Promise.resolve(context.registerTool({ ...tool, inputSchema, execute: run })).catch(() => {});
    } catch {
      /* an older shape of the API: the page works without the tools */
    }
  }
}
