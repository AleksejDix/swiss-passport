// Method page: draws the forgetting curve in and reads it out day by day, reacts to the question to try,
// mixes the topics and switches the language of the example question. Without this script every visual
// shows its final state; with reduced motion nothing moves, but everything still responds.
import { DAYS, W, PLOT, PLANS, recall, level, x } from "../viz/curve.ts";

// The script sets the start state of an animation itself, so without it every visual stays fully visible.
const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = "cubic-bezier(0.2, 0.7, 0.1, 1)";
// Resolves when the animation ends, also when it is cancelled.
const run = (el, keyframes, options) =>
  el.animate(keyframes, { duration: 500, easing: ease, fill: "forwards", ...options }).finished.catch(() => {});

/** Small element builder: text only via text nodes, empty children skipped. */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  el.append(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

/** Runs `play` once, when enough of the element is on screen. */
function whenVisible(el, play, threshold = 0.4) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    play();
  }, { threshold });
  observer.observe(el);
}

// ---- Forgetting curve: drawn from left to right, then a crosshair reads out every day ----------

for (const fig of document.querySelectorAll("[data-curve]")) {
  const L = JSON.parse(fig.dataset.labels);
  const plot = fig.querySelector("[data-plot]");
  const cross = fig.querySelector("[data-cross]");
  const tip = fig.querySelector("[data-tip]");
  let day = 0;

  const show = (t) => {
    day = Math.max(0, Math.min(DAYS, t));
    cross.setAttribute("x1", x(day));
    cross.setAttribute("x2", x(day));
    cross.setAttribute("visibility", "visible");
    const review = day > 0 && PLANS.spaced.reviews.includes(day);
    tip.replaceChildren(
      h("p", { class: "tip-day" }, `${L.day} ${day}`, review && ` · ${L.review}`),
      ...["spaced", "cram"].map((plan) =>
        h("p", {}, h("i", { class: `key key-${plan}` }), h("strong", {}, L.levels[level(recall(plan, day))]), " ", h("span", {}, L[plan])),
      ),
    );
    tip.hidden = false;
    const at = x(day) / W;
    tip.style.left = `${at * 100}%`;
    tip.style.transform = `translateX(${at < 0.25 ? "0" : at > 0.75 ? "-100%" : "-50%"})`;
  };
  const hide = () => {
    cross.setAttribute("visibility", "hidden");
    tip.hidden = true;
  };
  const dayAt = (e) => {
    const r = plot.getBoundingClientRect();
    const ux = ((e.clientX - r.left) / r.width) * W;
    return Math.round(((ux - PLOT.left) / (PLOT.right - PLOT.left)) * DAYS);
  };
  plot.addEventListener("pointermove", (e) => show(dayAt(e)));
  plot.addEventListener("pointerdown", (e) => show(dayAt(e)));
  plot.addEventListener("pointerleave", hide);
  plot.addEventListener("focus", () => show(day));
  plot.addEventListener("blur", hide);
  plot.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, Home: -DAYS, End: DAYS }[e.key];
    if (!step) return;
    e.preventDefault();
    show(day + step);
  });

  if (motion) {
    const reveal = fig.querySelector(".reveal");
    const dots = [...fig.querySelectorAll(".dot")];
    reveal.style.transform = "scaleX(0)";
    for (const dot of dots) dot.style.opacity = "0";
    whenVisible(fig, () => {
      const ms = 2400;
      run(reveal, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: ms, easing: "linear" });
      // Each review dot appears when the line reaches it.
      for (const dot of dots) {
        run(dot, [{ opacity: 0, transform: "scale(0.3)" }, { opacity: 1, transform: "scale(1)" }], {
          duration: 300,
          delay: (x(Number(dot.dataset.day)) / W) * ms,
          easing: "cubic-bezier(0.3, 1.6, 0.5, 1)",
        });
      }
    });
  }
}

// ---- Question to try: right or wrong, then why ---------------------------------------------------

for (const fig of document.querySelectorAll("[data-try]")) {
  const d = JSON.parse(fig.dataset.question);
  const buttons = [...fig.querySelectorAll("[data-letter]")];
  const out = fig.querySelector("[data-feedback]");
  const reset = () => {
    for (const b of buttons) {
      b.disabled = false;
      b.classList.remove("is-right", "is-wrong");
    }
    out.replaceChildren();
    buttons[0].focus();
  };
  for (const b of buttons) {
    b.addEventListener("click", () => {
      const letter = b.dataset.letter;
      const correct = letter === d.answer;
      for (const o of buttons) {
        o.disabled = true;
        if (o.dataset.letter === d.answer) o.classList.add("is-right");
        else if (o === b) o.classList.add("is-wrong");
      }
      out.replaceChildren(
        h("div", {},
          h("p", { class: `verdict${correct ? " ok" : ""}` }, correct ? d.right : `${d.wrong} ${d.answer.toUpperCase()}: ${d.options[d.answer]}`),
          !correct && d.distractors[letter] && h("p", {}, d.distractors[letter]),
          h("p", {}, d.why),
          h("p", {}, h("button", { class: "again", type: "button", onclick: reset }, d.again)),
        ),
      );
      if (motion) run(out, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 350 });
    });
  }
}

// ---- Mixed practice: the same twelve questions, first topic by topic, then mixed ----------------

for (const fig of document.querySelectorAll("[data-mix]")) {
  const row = fig.querySelector("[data-row]");
  const items = [...row.children];
  const mixed = JSON.parse(fig.dataset.mixed);
  const buttons = [...fig.querySelectorAll("[data-order]")];
  let order = "blocked";

  const arrange = (next) => {
    if (next === order) return;
    order = next;
    const before = new Map(items.map((el) => [el, el.getBoundingClientRect()]));
    row.append(...(next === "mixed" ? mixed : items.map((_, i) => i)).map((i) => items[i]));
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.order === next));
    if (!motion) return;
    // Each question hops from its old place to its new one.
    items.forEach((el, k) => {
      const dx = before.get(el).left - el.getBoundingClientRect().left;
      if (!dx) return;
      el.animate(
        [{ transform: `translate(${dx}px, 0)` }, { transform: `translate(${dx / 2}px, -0.75rem)` }, { transform: "none" }],
        { duration: 700, easing: ease, delay: k * 30 },
      );
    });
  };
  for (const b of buttons) b.addEventListener("click", () => arrange(b.dataset.order));
  if (motion) whenVisible(fig, () => setTimeout(() => arrange("mixed"), 700), 0.6);
}

// ---- Language switch: the question in any of the six languages, the German wording stays --------

for (const fig of document.querySelectorAll("[data-langswitch]")) {
  const texts = JSON.parse(fig.dataset.texts);
  const q = fig.querySelector("[data-q]");
  const qDe = fig.querySelector("[data-q-de]");
  const options = [...fig.querySelectorAll("[data-o]")];
  const optionsDe = [...fig.querySelectorAll("[data-o-de]")];
  const buttons = [...fig.querySelectorAll("[data-lang-choice]")];
  for (const b of buttons) {
    b.addEventListener("click", () => {
      const l = b.dataset.langChoice;
      q.textContent = texts[l].q;
      q.lang = l;
      for (const o of options) {
        o.textContent = texts[l].o[o.dataset.o];
        o.lang = l;
      }
      qDe.hidden = l === "de";
      for (const o of optionsDe) o.hidden = l === "de";
      for (const other of buttons) other.setAttribute("aria-pressed", String(other === b));
      if (motion) for (const el of [q, ...options]) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    });
  }
}
