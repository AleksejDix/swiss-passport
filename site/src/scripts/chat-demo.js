// Homepage "How it works": plays the chat once when it scrolls into view. The tutor "types" before each reply;
// once the tutor confirms, the right option is marked. Messages only turn invisible while waiting, so the page
// never shifts. Without this script, or with reduced motion, the whole chat is shown as it ends.
const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (const chat of document.querySelectorAll("[data-chat]")) {
  if (!motion) continue;
  const messages = [...chat.querySelectorAll(".msg")];
  const right = chat.querySelector(".opts .is-right");
  const confirm = chat.querySelector("[data-answer]");
  // Start state, set here so the chat stays complete if the script never runs.
  right?.classList.remove("is-right");
  for (const m of messages) m.classList.add("pending");

  const play = async () => {
    for (const m of messages) {
      if (m.classList.contains("tutor")) {
        const typing = document.createElement("span");
        typing.className = "typing";
        typing.setAttribute("aria-hidden", "true");
        typing.append(...Array.from({ length: 3 }, () => document.createElement("i")));
        m.append(typing);
        await wait(900);
        typing.remove();
      } else {
        await wait(600);
      }
      m.classList.remove("pending");
      m.animate(
        [
          { opacity: 0, transform: "translateY(0.375rem)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 300, easing: "ease-out" },
      );
      if (m === confirm) right?.classList.add("is-right");
    }
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      play();
    },
    { threshold: 0.4 },
  );
  observer.observe(chat);
}
