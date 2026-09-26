// Motion for the landing page: the Swiss cross, one quiz step played once, the language rotation,
// the review timeline, and the copy button. Everything is shown in its final state when motion is reduced.
const motion = document.documentElement.classList.contains("js-motion");
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const ease = "cubic-bezier(0.2, 0.7, 0.1, 1)";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Resolves when the animation ends, also when it is cancelled (e.g. the page is hidden).
const run = (el, keyframes, options) =>
  el.animate(keyframes, { duration: 500, easing: ease, fill: "forwards", ...options }).finished.catch(() => {});

const TRANSLATIONS = {
  en: "In votes, what does «majority of the cantons» (Ständemehr) mean?",
  fr: "Que signifie «majorité des cantons» lors des votations\u202F?",
  it: "Che cosa significa, nelle votazioni, «maggioranza dei Cantoni»?",
  ru: "Что означает при голосованиях «большинство кантонов» (Ständemehr)?",
  uk: "Що означає під час голосувань «більшість кантонів» (Ständemehr)?",
  de: "Das Original, wie es im Test steht.",
};

const demo = $(".demo");
const opts = $$("[data-opts] li", demo);
const right = $("[data-right]", demo);

function showAnswered() {
  right.classList.add("right");
  $("[data-step]", demo).textContent = "4/9";
  $("[data-bar]", demo).style.width = "44.4%";
}

async function playCross() {
  run($(".arm-h"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 450 });
  await wait(150);
  await run($(".arm-v"), [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 450 });
}

async function playDemo() {
  // The quiz step builds up line by line.
  run($("[data-bar]", demo), [{ width: "22.2%" }, { width: "33.3%" }], { duration: 700 });
  await run($("[data-q]", demo), [
    { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    { clipPath: "inset(0 0 0 0)", opacity: 1 },
  ], { duration: 800 });
  run($("[data-tr]", demo), [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 400 });
  await Promise.all(
    opts.map((li, i) =>
      run(li, [{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: 150 + i * 90 }),
    ),
  );

  // A red pointer travels to the chosen answer, like a learner's hand.
  await wait(600);
  const pointer = document.createElement("span");
  pointer.className = "pointer";
  $("[data-opts]", demo).append(pointer);
  const at = (li) => `translateY(${li.offsetTop}px)`;
  pointer.style.height = `${opts[0].offsetHeight}px`;
  await run(pointer, [{ opacity: 0, transform: at(opts[0]) }, { opacity: 1, transform: at(opts[0]) }], { duration: 250 });
  await run(pointer, [{ transform: at(opts[0]) }, { transform: at(right) }], { duration: 550, delay: 250 });
  right.classList.add("chosen");
  await wait(450);
  right.classList.remove("chosen");
  showAnswered();
  $("[data-step]", demo).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  $("[data-bar]", demo).animate([{ width: "33.3%" }, { width: "44.4%" }], { duration: 600, easing: ease });
  await run($("[data-verdict]", demo), [
    { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    { clipPath: "inset(0 0 0 0)", opacity: 1 },
  ], { duration: 900 });
  run(pointer, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 600 });

  await wait(1800);
  rotateLanguages();
}

// The translation line cycles through the learner languages; the German stays, as in the real test.
async function rotateLanguages() {
  const tr = $("[data-tr]", demo);
  const labels = $$("[data-lang]");
  const order = labels.map((l) => l.dataset.lang);
  let i = 0;
  for (;;) {
    await wait(2600);
    i = (i + 1) % order.length;
    const lang = order[i];
    await run(tr, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-4px)" }], { duration: 250 });
    tr.textContent = TRANSLATIONS[lang];
    tr.lang = lang;
    labels.forEach((l) => l.classList.toggle("on", l.dataset.lang === lang));
    await run(tr, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 350 });
  }
}

// Review timeline: the axis draws, then each review day appears where it falls in the month.
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

// Copy the connector address.
const copy = $("[data-copy]");
copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText($("[data-url]").textContent.trim());
  copy.textContent = "Copied";
  setTimeout(() => (copy.textContent = "Copy"), 2000);
});

/** Runs `play` once, when at least `threshold` of the element is on screen. */
function whenVisible(el, threshold, play) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    play();
  }, { threshold });
  observer.observe(el);
}

if (motion) {
  playCross();
  whenVisible(demo, 0.5, playDemo);
  watchTimeline();
} else {
  showAnswered();
}
