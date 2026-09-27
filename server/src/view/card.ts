// Quiz card shown inside the chat (MCP Apps view): concept, question and clickable options with pictures.
// Where the host lets views call tools, a click answers right here (answer tool) and the card updates in place,
// so the chat does not grow with every question. Otherwise a click sends the letter as a chat message.
import { App, type ToolResult } from "./bridge.js";

type Letter = "a" | "b" | "c" | "d";
interface Question {
  id: string;
  question: string;
  options: Record<Letter, string>;
  german?: { question: string; options: Record<Letter, string> };
}
interface Step {
  lesson?: { title: string; unit: string; position: string };
  explain_first?: { title: string; intro: string[]; key_terms: { term: string; definition: string }[]; mnemonic?: string };
  step: string;
  question: Question;
}
interface Feedback {
  correct?: boolean;
  recorded?: boolean;
  correct_answer?: Letter;
  correct_answer_text?: string;
  why?: string;
  about_your_answer?: string;
  note?: string;
  comes_again_later_in_this_round?: boolean;
}
interface Labels { right: string; wrongIs: string; again: string; next: string; done: string }
interface Card {
  lang?: string;
  /** The card's labels in the learner's language, from the server (i18n/<code>.json, key card). */
  labels: Labels;
  data: { learner_code?: string } & (Step | { feedback: Feedback; next?: Step; finished?: Record<string, unknown> } | Record<string, unknown>);
  images: Partial<Record<"question" | Letter, string>>;
}

const root = document.getElementById("root")!;
const app = new App({ name: "swiss-passport-card", version: "1.0.0" });
/** ChatGPT's own card API, next to the standard one. */
const openai = (window as { openai?: { setWidgetState?(state: unknown): void } }).openai;
let learnerCode: string | undefined;

const el = (tag: string, cls = "", text = "") => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

function render({ lang, labels: label, data, images }: Card) {
  learnerCode = data.learner_code ?? learnerCode;
  root.replaceChildren();
  const feedback = "feedback" in data ? (data.feedback as Feedback) : undefined;
  const step = ("question" in data ? data : "next" in data ? data.next : undefined) as Step | undefined;
  const finished = "finished" in data ? (data.finished as Record<string, unknown>) : undefined;

  if (feedback && !feedback.recorded) {
    const ok = feedback.correct;
    root.append(
      el("div", `banner ${ok ? "ok" : "bad"}`, ok ? `✓ ${label.right}` : `✗ ${label.wrongIs} ${feedback.correct_answer?.toUpperCase()}: ${feedback.correct_answer_text}`),
    );
    for (const text of [feedback.why, feedback.about_your_answer, feedback.note]) if (text) root.append(el("p", "para", text));
    if (feedback.comes_again_later_in_this_round) root.append(el("p", "muted", label.again));
    // The learner reads the explanation first; the next question comes on "Next".
    if (step) {
      const next = el("button", "next", label.next) as HTMLButtonElement;
      next.onclick = () => showStep(step, images, lang);
      root.append(next);
      return;
    }
  }
  if (finished) {
    const score = "score" in finished ? `${finished.score}/${finished.total}` : `${finished.correct_first_try}/${finished.total}`;
    root.append(el("div", "done", `🎉 ${score}`));
    return;
  }
  if (step) showStep(step, images, lang);
}

function showStep(step: Step, images: Card["images"], lang?: string) {
  root.replaceChildren();
  const [n, total] = step.step.split("/").map(Number);
  const head = el("div", "head");
  head.append(el("span", "title", step.lesson?.title ?? ""), el("span", "count", step.step));
  const bar = el("div", "bar");
  const fill = el("div", "fill");
  fill.style.width = `${(100 * (n - 1)) / total}%`;
  bar.append(fill);
  root.append(head, bar);

  const concept = step.explain_first;
  if (concept) {
    root.append(el("div", "concept", concept.title));
    for (const p of concept.intro) root.append(el("p", "para", p));
    const terms = el("div", "terms");
    for (const t of concept.key_terms) {
      const chip = el("span", "chip", t.term);
      chip.title = t.definition;
      terms.append(chip);
    }
    root.append(terms);
    if (concept.mnemonic) root.append(el("p", "muted", concept.mnemonic));
  }

  const q = step.question;
  root.append(el("div", "question", q.question));
  if (q.german) root.append(el("div", "german", q.german.question));
  if (images.question) {
    const img = el("img", "picture") as HTMLImageElement;
    img.src = images.question;
    root.append(img);
  }

  const opts = el("div", `options ${images.a ? "grid" : ""}`);
  for (const letter of ["a", "b", "c", "d"] as Letter[]) {
    const b = el("button", "option") as HTMLButtonElement;
    b.append(el("span", "letter", letter.toUpperCase()));
    if (images[letter]) {
      const img = el("img") as HTMLImageElement;
      img.src = images[letter]!;
      b.append(img);
    } else {
      b.append(el("span", "text", q.options[letter]));
    }
    b.onclick = async () => {
      opts.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
      b.classList.add("chosen");
      await choose(letter, q, lang);
    };
    opts.append(b);
  }
  root.append(opts);
}

/** Answers on the card itself where the host allows it; otherwise the letter goes to the chat. */
async function choose(letter: Letter, q: Question, lang?: string) {
  if (app.getHostCapabilities()?.serverTools) {
    try {
      const r = await app.callServerTool({
        name: "answer",
        arguments: { answer: letter, question_id: q.id, ...(learnerCode && { learner_code: learnerCode }) },
      });
      const card = cardOf(r);
      if (!r.isError && card?.data) {
        render(card);
        await tellModel(letter, q, card);
        if ("finished" in card.data) await app.sendMessage({ role: "user", content: [{ type: "text", text: card.labels.done }] });
        return;
      }
    } catch {
      // Fall back to the chat below.
    }
  }
  await app.sendMessage({ role: "user", content: [{ type: "text", text: letter.toUpperCase() }] });
}

/** Lets the tutor know what happened on the card, without a chat message. */
async function tellModel(letter: Letter, q: Question, { data }: Card) {
  const feedback = "feedback" in data ? (data.feedback as Feedback) : undefined;
  const now = ("question" in data ? data : "next" in data ? data.next : undefined) as Step | undefined;
  const result = feedback?.recorded ? "" : feedback ? (feedback.correct ? " (correct)" : " (wrong)") : "";
  const text =
    `Quiz card: the learner answered ${letter.toUpperCase()} to "${q.question}"${result}. ` +
    (now
      ? `The card now shows step ${now.step}: "${now.question.question}". Do not repeat it in the chat.`
      : "finished" in data
        ? `The round is finished: ${JSON.stringify(data.finished)}`
        : "");
  // ChatGPT shows ui/update-model-context as raw JSON above the chat box; its widget state reaches the model unseen.
  if (openai?.setWidgetState) return openai.setWidgetState({ modelContent: text });
  if (!app.getHostCapabilities()?.updateModelContext) return;
  await app.updateModelContext({ content: [{ type: "text", text }] }).catch(() => {});
}

/** The card's data: in _meta where only the card sees it (ChatGPT), otherwise in structuredContent. */
const cardOf = (result: ToolResult) => (result._meta?.card ?? result.structuredContent) as Card | undefined;

app.ontoolresult = (params) => {
  const card = cardOf(params);
  if (card?.data) render(card);
};
app.onhostcontextchanged = (ctx) => {
  if (ctx.theme) document.documentElement.dataset.theme = ctx.theme;
};
await app.connect();
const theme = app.getHostContext()?.theme;
if (theme) document.documentElement.dataset.theme = theme;
