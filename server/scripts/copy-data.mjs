// Copies the quiz content from the repository root into server/data so the bundle is self-contained.
import { cpSync, rmSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const data = new URL("../data/", import.meta.url);
rmSync(data, { recursive: true, force: true });
for (const item of ["quiz.json", "curriculum.json", "i18n", "images"]) {
  cpSync(new URL(item, root), new URL(item, data), { recursive: true });
}
