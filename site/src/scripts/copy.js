// Copies the MCP server address ([data-url]) with the button [data-copy], which says [data-copied] for 2 s.
const button = document.querySelector("[data-copy]");
button?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(document.querySelector("[data-url]").textContent.trim());
  const label = button.textContent;
  button.textContent = button.dataset.copied;
  setTimeout(() => (button.textContent = label), 2000);
});
