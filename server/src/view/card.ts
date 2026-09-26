// Quiz card shown inside the chat (MCP Apps view): progress, feedback, question and clickable options with pictures.
import { App } from "@modelcontextprotocol/ext-apps/app-with-deps";

type Letter = "a" | "b" | "c" | "d";
interface Question {
  id: string;
  question: string;
  options: Record<Letter, string>;
  german?: { question: string; options: Record<Letter, string> };
}
interface Step {
  lesson?: { title: string; unit: string; position: string };
  explain_first?: { title: string; key_terms: { term: string }[] };
  step: string;
  question: Question;
}
interface Feedback { correct?: boolean; recorded?: boolean; correct_answer?: Letter; correct_answer_text?: string }
interface Card {
  lang?: string;
  data: Step | { feedback: Feedback; next?: Step; finished?: Record<string, unknown> } | Record<string, unknown>;
  images: Partial<Record<"question" | Letter, string>>;
}

// Card labels in the learner's language.
const LABELS: Record<string, { right: string; wrongIs: string }> = {
  de: { right: "Richtig", wrongIs: "Richtig ist" },
  en: { right: "Correct", wrongIs: "Correct answer:" },
  fr: { right: "Correct", wrongIs: "Bonne réponse :" },
  it: { right: "Giusto", wrongIs: "Risposta giusta:" },
  ru: { right: "Верно", wrongIs: "Правильный ответ:" },
  uk: { right: "Правильно", wrongIs: "Правильна відповідь:" },
};

const root = document.getElementById("root")!;
const app = new App({ name: "swiss-passport-card", version: "1.0.0" });

const el = (tag: string, cls = "", text = "") => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

function render({ lang, data, images }: Card) {
  const label = LABELS[lang ?? "de"] ?? LABELS.de;
  root.replaceChildren();
  const feedback = "feedback" in data ? (data.feedback as Feedback) : undefined;
  const step = ("question" in data ? data : "next" in data ? data.next : undefined) as Step | undefined;
  const finished = "finished" in data ? (data.finished as Record<string, unknown>) : undefined;

  if (feedback && !feedback.recorded) {
    const ok = feedback.correct;
    root.append(
      el("div", `banner ${ok ? "ok" : "bad"}`, ok ? `✓ ${label.right}` : `✗ ${label.wrongIs} ${feedback.correct_answer?.toUpperCase()}: ${feedback.correct_answer_text}`),
    );
  }
  if (finished) {
    const score = "score" in finished ? `${finished.score}/${finished.total}` : `${finished.correct_first_try}/${finished.total}`;
    root.append(el("div", "done", `🎉 ${score}`));
    return;
  }
  if (!step) return;

  const [n, total] = step.step.split("/").map(Number);
  const head = el("div", "head");
  head.append(el("span", "title", step.lesson?.title ?? ""), el("span", "count", step.step));
  const bar = el("div", "bar");
  const fill = el("div", "fill");
  fill.style.width = `${(100 * (n - 1)) / total}%`;
  bar.append(fill);
  root.append(head, bar);

  if (step.explain_first) {
    const terms = el("div", "terms");
    for (const t of step.explain_first.key_terms) terms.append(el("span", "chip", t.term));
    root.append(el("div", "concept", step.explain_first.title), terms);
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
      await app.sendMessage({ role: "user", content: [{ type: "text", text: letter.toUpperCase() }] });
    };
    opts.append(b);
  }
  root.append(opts);
}

app.ontoolresult = (params) => {
  const card = params.structuredContent as Card | undefined;
  if (card?.data) render(card);
};
app.onhostcontextchanged = (ctx) => {
  if (ctx.theme) document.documentElement.dataset.theme = ctx.theme;
};
await app.connect();
const theme = app.getHostContext()?.theme;
if (theme) document.documentElement.dataset.theme = theme;
