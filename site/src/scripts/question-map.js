// Homepage, "All 350 questions at a glance": the dots fill in lesson by lesson when the map scrolls into view,
// and the line below names the lesson under the pointer or keyboard focus. Without this script every dot is shown.
const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const map of document.querySelectorAll("[data-qmap]")) {
  const readout = map.querySelector("[data-readout]");
  const show = (text, lesson) => {
    readout.textContent = text;
    readout.classList.toggle("is-lesson", lesson);
  };
  for (const a of map.querySelectorAll(".qmap-lesson")) {
    a.addEventListener("pointerenter", () => show(a.dataset.label, true));
    a.addEventListener("focus", () => show(a.dataset.label, true));
    a.addEventListener("pointerleave", () => show(map.dataset.hint, false));
    a.addEventListener("blur", () => show(map.dataset.hint, false));
  }

  if (!motion) continue;
  const dots = [...map.querySelectorAll(".qmap-lesson i")];
  for (const d of dots) d.style.opacity = "0";
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // 350 dots in about 1.4 seconds, in curriculum order.
      dots.forEach((d, i) =>
        d.animate(
          [
            { opacity: 0, transform: "scale(0.2)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          {
            duration: 260,
            delay: i * 4,
            easing: "cubic-bezier(0.3, 1.6, 0.5, 1)",
            fill: "forwards",
          },
        ),
      );
    },
    { threshold: 0.3 },
  );
  observer.observe(map);
}
