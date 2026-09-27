// Learn online: a client of the REST API /api/v1 (mcp/src/api.ts), which runs the same learning actions as the
// MCP tools that Claude and ChatGPT use, so progress is the same everywhere.
// Progress lives on the server under the learner code, which the browser remembers.
const API = "/api/v1";

// Interface text of every language, from the language files in i18n/ (key learn). The page puts it into
// data-text, so switching the language needs no reload. Quiz content comes translated from the server.
const app = document.querySelector("[data-app]");
const T = JSON.parse(app.dataset.text);
const LANGS = Object.fromEntries(Object.entries(T).map(([id, t]) => [id, t.name]));

const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode: code shown on screen */
    }
  },
};
/** The learner's language: saved choice, else the browser's language, else English. */
function currentLang() {
  const saved = store.get("sp-lang");
  if (saved in LANGS) return saved;
  return navigator.languages.map((l) => l.slice(0, 2)).find((l) => l in LANGS) ?? "en";
}
let lang = currentLang();
let code = store.get("sp-code");
const t = () => T[lang];

/** Small element builder: h("p", { class: "x" }, "text", child). */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

// The REST endpoint of each learning action: the same actions as the MCP tools of the AI apps (mcp/src/learning.ts).
const ROUTES = {
  get_progress: "/progress",
  start_lesson: "/lessons",
  start_reviews: "/reviews",
  start_mock_exam: "/exams",
  answer: "/answers",
};

/**
 * One request to the API, always JSON by POST: the learner code travels in the body, never in the address or a header.
 * Errors such as an unknown code (404) come back as JSON with "error"; only outages throw.
 */
async function request(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status >= 500 || !res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

/** Runs one learning action and returns { data, images }. A new learner gets a code first. */
async function call(name, { learner_code = code, ...args } = {}) {
  let json;
  if (!learner_code) {
    json = await request("/learners", { language: lang });
    learner_code = json.learner_code;
  }
  if (!(json && name === "get_progress")) json = await request(ROUTES[name], { learner_code, language: lang, ...args });
  const { images, ...data } = json;
  if (data.learner_code && !data.error) {
    code = data.learner_code;
    store.set("sp-code", code);
  }
  return { data, images: images ?? {} };
}

/**
 * Every screen uses the same frame: a head row, then two columns on large screens.
 * Right: what you act on (the question, the buttons). Left: information (explanation, progress).
 * On phones the right part comes first.
 */
function frame(head, act, info) {
  return [head, h("div", { class: "cols" }, h("section", { class: "act" }, act), h("aside", { class: "info" }, info))];
}

function show(...nodes) {
  app.replaceChildren(...nodes.flat().filter((n) => n != null && n !== false));
  window.scrollTo({ top: 0 });
}

function fail() {
  view = {};
  show(
    h("p", { class: "error", role: "alert" }, t().error),
    h("button", { class: "next", onclick: home }, t().overview),
  );
}

// ---- Language switch ------------------------------------------------------------------

function renderLangs() {
  const nav = document.querySelector("[data-langs]");
  nav.setAttribute("aria-label", t().langs);
  nav.replaceChildren(
    ...Object.entries(LANGS).map(([id, name]) =>
      h("button", { type: "button", lang: id, "aria-pressed": String(id === lang), onclick: () => setLang(id) }, name),
    ),
  );
  document.documentElement.lang = lang;
  document.title = `${t().title}: Swiss Passport`;
}
function setLang(id) {
  lang = id;
  store.set("sp-lang", id);
  renderLangs();
  return home();
}

// ---- Overview -------------------------------------------------------------------------

async function home() {
  let p;
  try {
    ({ data: p } = await call("get_progress"));
  } catch {
    return fail();
  }
  if (p.error) {
    // The stored code is unknown on the server: start fresh.
    code = null;
    return home();
  }
  const s = t();
  const exams = p.last_exams.map((e) => `${e.score}/${e.total}`).join(", ");
  show(
    ...frame(
      h(
        "div",
        { class: "intro" },
        h("h1", {}, s.title),
        h("p", { class: "overview-lede" }, s.lede),
        h("p", { class: "note" }, s.unofficial),
      ),
      // Up to three lessons from different units to choose from, the recommended one first; then reviews and the mock exam.
      [
        h(
          "div",
          { class: "actions" },
          h("h2", { class: "actions-title" }, p.lessons_done ? s.chooseNext : s.startWith),
          p.lesson_choices.length
            ? p.lesson_choices.slice(0, 3).map((l, i) =>
                h(
                  "button",
                  {
                    class: `action${i ? "" : " primary"}`,
                    onclick: () => start("start_lesson", { lesson_id: l.id }),
                  },
                  h("span", {}, `${s.lesson} ${Number(l.id.slice(1))}: ${l.title}`),
                  h("span", {}, i ? l.unit : s.recommended),
                ),
              )
            : h("button", { class: "action primary", disabled: true }, h("span", {}, s.allDone), h("span", {})),
        ),
        h(
          "div",
          { class: "actions" },
          h(
            "button",
            { class: "action", onclick: () => start("start_reviews"), disabled: !p.reviews_due },
            h("span", {}, s.reviews),
            h("span", {}, p.reviews_due ? s.due.replace("{n}", p.reviews_due) : s.noneDue),
          ),
          h(
            "button",
            { class: "action", onclick: () => start("start_mock_exam") },
            h("span", {}, s.exam),
            h("span", {}, s.examSub),
          ),
        ),
      ],
      [
        h(
          "section",
          { class: "stats" },
          h(
            "table",
            { class: "facts" },
            h("tr", {}, h("td", {}, `${p.lessons_done}/${p.lessons_total}`), h("th", { scope: "row" }, s.lessonsDone)),
            exams &&
              h(
                "tr",
                {},
                h("td", {}, String(p.last_exams.length)),
                h("th", { scope: "row" }, `${s.examsDone}: ${exams}`),
              ),
          ),
          h("p", { class: "small readiness-title" }, s.ready),
          h(
            "ul",
            { class: "readiness" },
            p.readiness_by_category.map((c) =>
              h(
                "li",
                {},
                h("span", {}, c.category),
                h("span", {}, `${c.percent}%`),
                h("span", { class: "meter", "aria-hidden": "true" }, h("i", { style: `width:${c.percent}%` })),
              ),
            ),
          ),
        ),
        h(
          "section",
          { class: "code" },
          h("p", {}, `${s.yourCode}: `, h("strong", {}, code)),
          h("p", { class: "small" }, s.codeHelp),
          h(
            "form",
            { onsubmit: useCode },
            h("input", {
              name: "code",
              "aria-label": s.haveCode,
              placeholder: s.haveCode,
              autocomplete: "off",
              spellcheck: "false",
            }),
            h("button", { type: "submit" }, s.useCode),
          ),
          h("p", { class: "error", role: "alert", "data-code-error": true, hidden: true }, s.unknownCode),
        ),
      ],
    ),
  );
  view = {};
  return p;
}

async function useCode(event) {
  event.preventDefault();
  const entered = new FormData(event.target).get("code").toString().trim();
  if (!entered) return;
  const { data } = await call("get_progress", { learner_code: entered }).catch(() => ({ data: { error: true } }));
  if (data.error) {
    document.querySelector("[data-code-error]").hidden = false;
    return;
  }
  home();
}

// ---- Quiz steps -----------------------------------------------------------------------

let kind = "lesson";
// What the screen shows (a step, its feedback, a summary), so the agent tools can report it.
let view = {};
let stepTitle;

async function start(tool, args = {}) {
  kind = { start_lesson: "lesson", start_reviews: "review", start_mock_exam: "exam" }[tool];
  try {
    const { data, images } = await call(tool, args);
    if (!data.question) await home();
    else renderStep(data, images);
    return data;
  } catch {
    fail();
  }
}

// Concept explanations seen in this session, so every question of a concept can offer it again.
const conceptCache = new Map();

/** The concept explanation, collapsed: learners try the question first and open it when they want. */
function conceptDetails(c, open = false) {
  return h(
    "details",
    { class: "explain", open },
    h("summary", {}, t().showExplanation),
    h(
      "div",
      { class: "explain-body" },
      c.intro.map((para) => h("p", {}, para)),
      h(
        "dl",
        { class: "terms-list" },
        c.key_terms.flatMap((k) => [h("dt", { lang: "de" }, k.term), h("dd", {}, k.definition)]),
      ),
      c.mnemonic && h("p", { class: "mnemonic" }, c.mnemonic),
    ),
  );
}

/**
 * One step, always in the same layout: the question with its options and the Next button on the right,
 * the explanation on the left (on phones: question first, explanation below).
 */
function renderStep(step, images, lessonTitle) {
  const s = t();
  const q = step.question;
  const title = step.lesson
    ? `${s.lesson} ${step.lesson.position.split("/")[0]}: ${step.lesson.title}`
    : (lessonTitle ?? (kind === "exam" ? s.exam : s.reviews));
  view = { step };
  stepTitle = title;
  if (step.explain_first) conceptCache.set(step.explain_first.title, step.explain_first);
  const concept = kind === "exam" ? undefined : conceptCache.get(step.concept);
  const hasPictures = Boolean(images.a);
  const choices = ["a", "b", "c", "d"].map((letter) =>
    h(
      "button",
      { class: "choice", type: "button", "data-letter": letter, onclick: () => answer(letter, title) },
      h("b", {}, letter.toUpperCase()),
      images[letter]
        ? h("img", { src: images[letter], alt: `${letter.toUpperCase()}` })
        : h("span", {}, q.options[letter]),
    ),
  );
  const heading = h("h1", { class: "question", tabindex: "-1" }, q.question);
  show(
    ...frame(
      h(
        "div",
        { class: "intro-step" },
        h(
          "div",
          { class: "step-head" },
          h("span", {}, title),
          h("span", {}, step.step),
          h("button", { type: "button", onclick: home }, s.overview),
        ),
        h("div", { class: "bar" }, h("i", { style: `width:${progressPercent(step.step)}%` })),
      ),
      [
        step.retry && h("p", { class: "retry" }, s.retry),
        heading,
        q.german && h("p", { class: "german", lang: "de" }, q.german.question),
        images.question && h("img", { class: "qpicture", src: images.question, alt: "" }),
        h("div", { class: `choices${hasPictures ? " pictures" : ""}`, "data-choices": true }, choices),
        // Screen readers announce the verdict; focus moves on to Next.
        h("div", { "data-after": true, "aria-live": "polite" }),
        h("p", { class: "hint" }, s.keys),
      ],
      [
        h("h2", { class: "info-title" }, kind === "exam" ? s.exam : step.concept),
        h("div", { "data-feedback": true }),
        kind === "exam"
          ? h("p", { class: "small" }, s.examNote)
          : concept
            ? conceptDetails(concept)
            : h("p", { class: "small", "data-answer-first": true }, s.answerFirst),
      ],
    ),
  );
  heading.focus({ preventScroll: true });
}

const progressPercent = (step) => {
  const [n, total] = step.split("/").map(Number);
  return Math.round((100 * (n - 1)) / total);
};

let pendingNext = null;

async function answer(letter, title) {
  const buttons = [...document.querySelectorAll("[data-choices] button")];
  if (buttons[0]?.disabled) return;
  buttons.forEach((b) => (b.disabled = true));
  document.querySelector(`[data-letter="${letter}"]`).classList.add("chosen");
  let r;
  try {
    r = await call("answer", { answer: letter });
  } catch {
    return fail();
  }
  const { data, images } = r;
  if (data.error) return home();

  if (kind === "exam") {
    // No feedback in the mock exam: straight to the next question or the result.
    if (data.next) renderStep(data.next, images, title);
    else renderExamResult(data.finished);
    return data;
  }

  const f = data.feedback;
  const s = t();
  buttons.forEach((b) => {
    b.classList.remove("chosen");
    if (b.dataset.letter === f.correct_answer) b.classList.add("is-right");
    else if (b.dataset.letter === letter) b.classList.add("is-wrong");
  });

  // Right: the verdict and the Next button, always in the same place.
  const next = h("button", { class: "next", type: "button", onclick: () => proceed() }, s.next);
  // h() drops empty parts; plain append() would print "false"/"undefined".
  document
    .querySelector("[data-after]")
    .append(
      h(
        "div",
        {},
        h(
          "p",
          { class: `verdict-line${f.correct ? " ok" : ""}` },
          f.correct ? s.right : `${s.wrong} ${f.correct_answer.toUpperCase()}: ${f.correct_answer_text}`,
        ),
        f.correct_answer_german && !f.correct && h("p", { class: "german", lang: "de" }, f.correct_answer_german),
        f.comes_again_later_in_this_round && h("p", { class: "retry" }, s.comesAgain),
        next,
      ),
    );
  document.querySelector(".hint")?.remove();

  // Left: why, why not the chosen option, notes and the source.
  document
    .querySelector("[data-feedback]")
    .append(
      h(
        "section",
        { class: "feedback" },
        h("p", {}, f.why),
        f.about_your_answer && h("p", {}, f.about_your_answer),
        f.note && h("p", { class: "note mnemonic" }, f.note),
        f.sources?.[0] &&
          h(
            "p",
            { class: "src" },
            `${s.source}: `,
            h(
              "a",
              { href: f.sources[0], target: "_blank", rel: "noopener" },
              new URL(f.sources[0]).hostname.replace(/^www\./, ""),
            ),
          ),
      ),
    );
  document.querySelector("[data-answer-first]")?.remove();

  pendingNext = () => (data.next ? renderStep(data.next, images, title) : renderSummary(data.finished));
  view.feedback = f;
  next.focus({ preventScroll: true });
  return data;
}

function proceed() {
  const next = pendingNext;
  pendingNext = null;
  next?.();
}

function renderSummary(f) {
  const s = t();
  view = { summary: f };
  show(
    ...frame(
      h("div", { class: "intro" }, h("h1", {}, f.lesson ? s.doneLesson : s.doneReview)),
      [
        h("p", { class: "score" }, `${f.correct_first_try}/${f.total}`),
        h("p", {}, s.firstTry),
        h(
          "div",
          { class: "actions" },
          f.next_lesson &&
            h(
              "button",
              { class: "action primary", onclick: () => start("start_lesson") },
              h("span", {}, s.nextLesson),
              h("span", {}, f.next_lesson),
            ),
          f.reviews_due > 0 &&
            h(
              "button",
              { class: "action", onclick: () => start("start_reviews") },
              h("span", {}, s.reviews),
              h("span", {}, s.due.replace("{n}", f.reviews_due)),
            ),
          h("button", { class: "action", onclick: home }, h("span", {}, s.overview), h("span", {})),
        ),
      ],
      [h("h2", { class: "info-title" }, s.whatNext), h("p", {}, s.whatNextText)],
    ),
  );
}

function renderExamResult(r) {
  const s = t();
  view = { examResult: r };
  show(
    ...frame(
      h("div", { class: "intro" }, h("h1", {}, s.examResult)),
      [
        h("p", { class: "score" }, `${r.score}/${r.total}`),
        h("p", { class: "small" }, s.passMark),
        h(
          "div",
          { class: "actions" },
          h("button", { class: "action primary", onclick: home }, h("span", {}, s.overview), h("span", {})),
        ),
      ],
      [
        r.mistakes.length > 0 && h("h2", { class: "info-title" }, s.mistakes),
        h(
          "ol",
          { class: "mistakes" },
          r.mistakes.map((m) =>
            h(
              "li",
              {},
              h("p", { class: "q" }, m.question),
              h("p", { class: "w" }, `${s.yours}: ${m.your_answer.toUpperCase()}`),
              h("p", { class: "a" }, `${m.correct_answer.toUpperCase()}: ${m.correct_answer_text}`),
              h("p", { class: "w" }, m.why),
            ),
          ),
        ),
      ],
    ),
  );
}

// Keyboard: A to D answer, Enter continues. Only while focus is on the question screen (WCAG 2.1.4),
// so the letters never fire from the menus or collide with screen reader and voice control keys.
document.addEventListener("keydown", (e) => {
  if (!e.target.closest(".cols") || e.target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
  const letter = e.key.toLowerCase();
  const btn = document.querySelector(`[data-choices] [data-letter="${letter}"]:not(:disabled)`);
  if (btn) {
    e.preventDefault();
    btn.click();
    return;
  }
  if (e.key === "Enter" && pendingNext && !e.target.closest("button")) {
    e.preventDefault();
    proceed();
  }
});

// ---- WebMCP: the same learning for an AI agent in the browser ----------------------------
// Chrome offers document.modelContext (behind a flag or in its origin trial); elsewhere nothing happens.
// Every tool operates this page, so the learner sees each step the agent takes.

/** A step as the agent receives it: the question and options in the learner's language and in German. */
const stepForAgent = (step) => ({
  mode: kind,
  step: step.step,
  ...(step.lesson && { lesson: step.lesson.title }),
  ...(kind !== "exam" && { topic: step.concept }),
  ...(step.explain_first && { explain_first: step.explain_first }),
  ...(step.retry && { retry: "The learner got this question wrong earlier in this round." }),
  question: step.question.question,
  options: step.question.options,
  ...(step.question.german && { german: step.question.german }),
  ...((step.question.image || step.question.option_images) && {
    pictures: "The question has pictures, shown on the page.",
  }),
});

const NO_QUESTION = "There is no open question on the page. Start a lesson, reviews or a mock exam first.";

const AGENT_TOOLS = [
  {
    name: "get_progress",
    title: "Learning progress",
    description:
      "Returns the learner's progress: lessons done, reviews due, an unfinished round, readiness per topic and recent mock exams. Does not change the page.",
    annotations: { readOnlyHint: true },
    async execute() {
      const { data } = await call("get_progress");
      const { learner_code, new_learner_code, ...progress } = data;
      return progress;
    },
  },
  ...[
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
  ].map(([name, title, description]) => ({
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
    async execute({ lesson_id } = {}) {
      const data = await start(name, lesson_id ? { lesson_id } : {});
      if (!data) return { error: t().error };
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
        answer: { type: "string", enum: ["a", "b", "c", "d"], description: "The letter the learner chose." },
      },
      required: ["answer"],
    },
    async execute({ answer: letter } = {}) {
      if (!["a", "b", "c", "d"].includes(letter)) return { error: "answer must be a, b, c or d." };
      if (!view.step || view.feedback)
        return { error: view.feedback ? "This question is answered. Call next_question." : NO_QUESTION };
      const exam = kind === "exam";
      const data = await answer(letter, stepTitle);
      if (!data?.feedback) return { error: t().error };
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
      if (!pendingNext) return { error: view.step ? "Answer the question on the page first." : NO_QUESTION };
      proceed();
      return view.step ? stepForAgent(view.step) : { round_finished: view.summary };
    },
  },
  {
    name: "set_language",
    title: "Change the language",
    description:
      "Switches the page to the learner's language and shows the overview. The German wording of the real test stays visible next to it.",
    inputSchema: {
      type: "object",
      properties: {
        language: { type: "string", enum: Object.keys(LANGS), description: Object.keys(LANGS).join(", ") },
      },
      required: ["language"],
    },
    async execute({ language } = {}) {
      if (!(language in LANGS)) return { error: `language must be one of ${Object.keys(LANGS).join(", ")}.` };
      await setLang(language);
      return { language: LANGS[language] };
    },
  },
];

function registerAgentTools() {
  const context = document.modelContext ?? navigator.modelContext;
  if (!context?.registerTool) return;
  for (const { execute, inputSchema = { type: "object", properties: {} }, ...tool } of AGENT_TOOLS) {
    // Tools return text; the agent gets JSON it can read, also when the server cannot be reached.
    const run = async (input) => JSON.stringify(await execute(input ?? {}).catch(() => ({ error: t().error })));
    try {
      Promise.resolve(context.registerTool({ ...tool, inputSchema, execute: run })).catch(() => {});
    } catch {
      /* an older shape of the API: the page works without the tools */
    }
  }
}

renderLangs();
home();
registerAgentTools();
