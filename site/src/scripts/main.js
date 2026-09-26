import { STRINGS } from "./i18n.js";
import { MAP, HERO_QUESTION } from "./map-data.js";

// Homepage: the canton map with a real exam question, the review timeline and the copy button.
// The page is rendered in its language at build time; the script only adds the interactive parts.
// Everything is shown in its final state when motion is reduced.
const motion = document.documentElement.classList.contains("js-motion");
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const ease = "cubic-bezier(0.2, 0.7, 0.1, 1)";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Resolves when the animation ends, also when it is cancelled (e.g. the page is hidden).
const run = (el, keyframes, options) =>
  el.animate(keyframes, { duration: 500, easing: ease, fill: "forwards", ...options }).finished.catch(() => {});
const SVG = "http://www.w3.org/2000/svg";

const lang = document.documentElement.lang;
const S = () => STRINGS[lang];

/** Small element builder that skips empty children. */
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

// ---- The Swiss cross in the logo --------------------------------------------------------

async function playCross() {
  run($(".arm-h"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 450 });
  await wait(150);
  await run($(".arm-v"), [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 450 });
}

// ---- Canton map -----------------------------------------------------------------------

const svg = $("[data-map]");
svg.setAttribute("viewBox", `0 0 ${MAP.width} ${MAP.height}`);
const cantonEls = MAP.cantons.map((c) => {
  const path = document.createElementNS(SVG, "path");
  path.setAttribute("d", c.d);
  path.setAttribute("class", "canton");
  path.dataset.abbr = c.abbr;
  svg.append(path);
  return { ...c, el: path };
});
for (const d of MAP.lakes) {
  const lake = document.createElementNS(SVG, "path");
  lake.setAttribute("d", d);
  lake.setAttribute("class", "lake");
  svg.append(lake);
}
// West to east: the order in which the country is drawn and the votes are counted.
const westToEast = [...cantonEls].sort((a, b) => a.cx - b.cx);

async function drawMap() {
  westToEast.forEach((c, i) =>
    run(c.el, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: i * 45 }),
  );
  await wait(westToEast.length * 45 + 300);
  $$(".lake", svg).forEach((l) => run(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 }));
}

// ---- Vote count: majority of the cantons ---------------------------------------------

const NEEDED = 12;
const TOTAL = 23;
const fmt = (n) => (Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`);

function setTally(votes) {
  $("[data-count]").textContent = fmt(votes);
  $("[data-tally]").style.width = `${(votes / TOTAL) * 100}%`;
}

function resetMap() {
  cantonEls.forEach((c) => c.el.classList.remove("yes"));
  setTally(0);
  const note = $("[data-tally-note]");
  note.classList.remove("tally-note-done");
  note.textContent = S().hero_rule;
}

/** Cantons say yes one by one, from west to east, until 12 of 23 cantonal votes are reached. */
async function countVotes() {
  let votes = 0;
  for (const c of westToEast) {
    if (votes >= NEEDED) break;
    c.el.classList.add("yes");
    votes += c.half ? 0.5 : 1;
    setTally(votes);
    if (motion) await wait(260);
  }
  const note = $("[data-tally-note]");
  note.textContent = S().hero_reached;
  note.classList.add("tally-note-done");
}

// ---- The exam question ------------------------------------------------------------------

let answered = false;

function renderQuestion() {
  answered = false;
  const t = HERO_QUESTION.text[lang];
  const de = HERO_QUESTION.text.de;
  $("[data-hq-de]").textContent = de.question;
  const tr = $("[data-hq-tr]");
  tr.textContent = lang === "de" ? "" : t.question;
  tr.hidden = lang === "de";
  tr.lang = lang;
  $("[data-hero-choices]").replaceChildren(
    ...["a", "b", "c", "d"].map((letter) =>
      h("button", { class: "hchoice", type: "button", "data-letter": letter, onclick: () => choose(letter) },
        h("b", {}, letter.toUpperCase()),
        h("span", { lang },
          t.options[letter],
          lang !== "de" && h("small", { lang: "de" }, de.options[letter]))),
    ),
  );
  $("[data-hero-feedback]").replaceChildren();
  resetMap();
}

async function choose(letter) {
  if (answered) return;
  answered = true;
  const t = HERO_QUESTION.text[lang];
  const right = HERO_QUESTION.answer;
  const correct = letter === right;
  $$("[data-hero-choices] button").forEach((b) => {
    b.disabled = true;
    if (b.dataset.letter === right) b.classList.add("is-right");
    else if (b.dataset.letter === letter) b.classList.add("is-wrong");
  });
  const s = S();
  // Wrapped in h() so that empty parts are skipped (replaceChildren would print "false").
  $("[data-hero-feedback]").replaceChildren(h("div", {},
    h("p", { class: `verdict${correct ? " ok" : ""}` }, correct ? s.hero_right : `${s.hero_wrong} ${right.toUpperCase()}: ${t.options[right]}`),
    !correct && t.distractors?.[letter] && h("p", {}, t.distractors[letter]),
    h("p", {}, t.why),
    h("p", {},
      h("a", { class: "button", href: "/learn/" }, s.hero_cta),
      h("button", { class: "again", type: "button", onclick: renderQuestion }, s.hero_again)),
  ));
  // On phones the map sits above the question: bring it into view to show the count.
  const map = $("[data-map-figure]");
  if (map.getBoundingClientRect().top < 0) map.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "start" });
  await countVotes();
}

// ---- Review timeline: the axis draws, then each review day appears where it falls ------

/** Runs `play` once, when at least `threshold` of the element is on screen. */
function whenVisible(el, threshold, play) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    play();
  }, { threshold });
  observer.observe(el);
}

function watchTimeline() {
  const tl = $("[data-timeline]");
  whenVisible(tl, 0.8, () => {
    const drawMs = 1100;
    run($(".axis", tl), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: drawMs });
    $$("span", tl).forEach((mark) => {
      const day = Number(getComputedStyle(mark).getPropertyValue("--d"));
      const base = mark === tl.lastElementChild ? "translateX(-100%)" : "translateX(-50%)";
      run(mark, [
        { opacity: 0, transform: `${base} scale(0.4)` },
        { opacity: 1, transform: `${base} scale(1)` },
      ], { duration: 350, delay: Math.sqrt(day / 30) * drawMs, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)" });
    });
  });
}

// ---- Copy the connector address ---------------------------------------------------------

const copy = $("[data-copy]");
copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText($("[data-url]").textContent.trim());
  copy.textContent = S().copied;
  setTimeout(() => (copy.textContent = S().copy), 2000);
});

renderQuestion();

if (motion) {
  playCross();
  drawMap();
  watchTimeline();
}
