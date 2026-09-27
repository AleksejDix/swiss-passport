/* global Reveal, RevealNotes, RevealHighlight */
// The talk's moving parts on top of reveal.js: fragments that switch a class, the MCP flow, numbers that count up,
// the word that changes language, typed text, the room's quiz, the quiz card, the text or voice switches and a
// question read aloud by the browser.

const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Every visit of a slide gets a number: what an earlier visit started stops when it changes.
let visit = 0;

/**
 * Fragments with data-add switch that class on data-target (a selector inside the slide, the slide itself if
 * missing) while they are shown; fragments with data-flow set the step of the slide's .flow. Also run on arrival,
 * where reveal.js shows every fragment at once when coming back from the next slide.
 */
function sync(slide) {
  const toggles = all(".fragment[data-add]", slide).map((fragment) => ({
    target: fragment.dataset.target ? slide.querySelector(fragment.dataset.target) : slide,
    name: fragment.dataset.add,
    on: fragment.classList.contains("visible"),
  }));
  // Removed and added in one go, so an animation that stays on does not start again.
  for (const { target, name } of toggles) target?.classList.remove(name);
  for (const { target, name, on } of toggles) if (on) target?.classList.add(name);
  const flow = slide.querySelector(".flow");
  if (flow) {
    const steps = all(".fragment[data-flow].visible", slide).map((fragment) => Number(fragment.dataset.flow));
    flow.dataset.step = String(Math.max(0, ...steps));
  }
}

function countUp(element, id) {
  const to = Number(element.dataset.to);
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min(1, (now - start) / 1400);
    element.textContent = String(Math.round(to * (1 - (1 - t) ** 3)));
    if (t < 1 && id === visit) requestAnimationFrame(frame);
    else element.textContent = String(to);
  };
  requestAnimationFrame(frame);
}

/** data-words="en:Learn online|de:Online lernen|…": one after the other, as long as the slide is shown. */
async function rotate(element, id) {
  const words = element.dataset.words.split("|").map((entry) => entry.split(":"));
  const show = ([lang, word]) => {
    element.lang = lang;
    element.textContent = word;
  };
  show(words[0]);
  for (let i = 1; ; i++) {
    await wait(1500);
    if (id !== visit) return;
    element.classList.add("out");
    await wait(300);
    show(words[i % words.length]);
    element.classList.remove("out");
  }
}

// Typing goes by the clock, not by timer ticks: a busy or throttled browser skips ahead instead of lagging behind.

async function typewriter(element, id) {
  element.dataset.text ??= element.textContent.trim();
  const text = element.dataset.text;
  element.textContent = "";
  await wait(500);
  const started = performance.now();
  while (id === visit) {
    const shown = Math.floor((performance.now() - started) / 30);
    element.textContent = text.slice(0, shown);
    if (shown >= text.length) return;
    await wait(30);
  }
  element.textContent = text;
}

/** Lines of a .terminal: the command typed key by key, then the output line by line. */
async function terminal(element, id) {
  const cursor = Object.assign(document.createElement("span"), { className: "cursor" });
  let end = 600;
  const plan = all(".line", element).map((line) => {
    line.dataset.text ??= line.textContent;
    const typed = line.classList.contains("prompt");
    const step = { line, begin: end, typed };
    end += typed ? line.dataset.text.length * 55 + 700 : 350;
    return step;
  });
  const started = performance.now();
  while (id === visit) {
    const now = performance.now() - started;
    for (const { line, begin, typed } of plan) {
      const text = line.dataset.text;
      line.textContent = now < begin ? "" : typed ? text.slice(0, Math.floor((now - begin) / 55)) : text;
    }
    plan.findLast((step) => step.begin <= now)?.line.append(cursor);
    if (now >= end) return;
    await wait(40);
  }
}

/** Reads the slide's [data-say] parts aloud with the browser's own voice and marks the part being read. */
function readAloud(slide) {
  const speech = window.speechSynthesis;
  const parts = all("[data-say]", slide);
  if (!speech || !parts.length) return;
  speech.cancel();
  const voices = speech.getVoices().filter((voice) => voice.localService);
  const voice = voices.find((v) => v.lang === "en-GB") ?? voices.find((v) => v.lang.startsWith("en"));
  for (const part of parts) {
    const utterance = new SpeechSynthesisUtterance(part.dataset.say);
    utterance.lang = "en-GB";
    if (voice) utterance.voice = voice;
    utterance.onstart = () => part.classList.add("now");
    utterance.onend = utterance.onerror = () => part.classList.remove("now");
    speech.speak(utterance);
  }
}

function enter(slide) {
  const id = ++visit;
  window.speechSynthesis?.cancel();
  sync(slide);
  for (const element of all("[data-to]", slide)) countUp(element, id);
  for (const element of all(".rotator", slide)) rotate(element, id);
  for (const element of all(".typewriter", slide)) typewriter(element, id);
  for (const element of all(".terminal", slide)) terminal(element, id);
}

document.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!button) return;
  // Without focus, Space goes on to the next slide instead of pressing the button again.
  button.blur();
  // The room's answer: one option marked.
  const quiz = button.closest(".quiz");
  if (quiz) for (const option of all("button", quiz)) option.classList.toggle("picked", option === button);
  // The quiz card checks the click itself, like the real one.
  const card = button.closest(".qcard");
  if (card) {
    const right = button.dataset.letter === card.dataset.answer;
    for (const option of all("button", card)) option.classList.toggle("chosen", option === button);
    card.dataset.result = right ? "ok" : "bad";
    card.querySelector(".qc-banner").textContent = right ? card.dataset.right : card.dataset.wrong;
  }
  // Text chat or voice.
  const modes = button.closest(".switch") ? button.closest(".modes") : null;
  if (modes) modes.classList.toggle("voice", button.dataset.mode === "voice");
  if (button.classList.contains("speak")) readAloud(button.closest("section"));
});

Reveal.initialize({
  hash: true,
  width: 1600,
  height: 900,
  margin: 0.04,
  center: false,
  controls: true,
  controlsTutorial: false,
  progress: true,
  slideNumber: "c/t",
  transition: "slide",
  backgroundTransition: "fade",
  // PDF: one page per slide, with every step shown.
  pdfSeparateFragments: false,
  plugins: [RevealNotes, RevealHighlight],
});

Reveal.on("ready", (event) => enter(event.currentSlide));
Reveal.on("slidechanged", (event) => enter(event.currentSlide));
Reveal.on("fragmentshown", () => sync(Reveal.getCurrentSlide()));
Reveal.on("fragmenthidden", () => sync(Reveal.getCurrentSlide()));
// PDF export: every slide in its final state.
Reveal.on("pdf-ready", () => all(".reveal .slides section").forEach((slide) => sync(slide)));

Reveal.addKeyBinding({ keyCode: 82, key: "R", description: "Read the question aloud" }, () =>
  readAloud(Reveal.getCurrentSlide()),
);
Reveal.addKeyBinding({ keyCode: 84, key: "T", description: "Switch between text chat and voice" }, () =>
  Reveal.getCurrentSlide().querySelector(".modes")?.classList.toggle("voice"),
);
