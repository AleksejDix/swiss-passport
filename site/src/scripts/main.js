// Homepage: the Swiss cross in the logo and the review timeline.
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

// ---- The Swiss cross in the logo --------------------------------------------------------

async function playCross() {
  run($(".arm-h"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 450 });
  await wait(150);
  await run($(".arm-v"), [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 450 });
}

// ---- Review timeline: the axis draws, then each review day appears where it falls ------

/** Runs `play` once, when at least `threshold` of the element is on screen. */
function whenVisible(el, threshold, play) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      play();
    },
    { threshold },
  );
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
      run(
        mark,
        [
          { opacity: 0, transform: `${base} scale(0.4)` },
          { opacity: 1, transform: `${base} scale(1)` },
        ],
        { duration: 350, delay: Math.sqrt(day / 30) * drawMs, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)" },
      );
    });
  });
}

if (motion) {
  playCross();
  watchTimeline();
}
