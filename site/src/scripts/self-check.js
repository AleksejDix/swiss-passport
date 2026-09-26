// Test guide, "Do I have to take the test?": answer the canton's four exemption questions one by one.
// "Yes" ends the check (no test needed); four times "no" means the test is needed. Without this script the
// figure reads as a flowchart.
for (const check of document.querySelectorAll("[data-check]")) {
  const steps = [...check.querySelectorAll(".chk-step")];
  const end = check.querySelector(".chk-end");
  const out = check.querySelector("[data-out]");
  const result = check.querySelector("[data-result]");

  const activate = (i) => steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
  const finish = (text) => {
    activate(-1);
    result.textContent = text;
    out.hidden = false;
  };
  const reset = () => {
    for (const s of steps) s.classList.remove("is-yes", "is-no");
    end.classList.remove("is-hit");
    out.hidden = true;
    activate(0);
    steps[0].querySelector("button")?.focus();
  };

  steps.forEach((step, i) => {
    step.querySelector('[data-answer="yes"]').addEventListener("click", () => {
      step.classList.add("is-yes");
      finish(check.dataset.resultNo);
    });
    step.querySelector('[data-answer="no"]').addEventListener("click", () => {
      step.classList.add("is-no");
      if (i + 1 < steps.length) {
        activate(i + 1);
        steps[i + 1].querySelector("button").focus();
      } else {
        end.classList.add("is-hit");
        finish(check.dataset.resultYes);
      }
    });
  });
  check.querySelector("[data-again]").addEventListener("click", reset);
  check.classList.add("is-live");
  activate(0);
}
