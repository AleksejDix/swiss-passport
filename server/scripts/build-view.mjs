// Bundles the quiz card (src/view) into one self-contained HTML file: data/card.html.
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

const js = await build({ entryPoints: ["src/view/card.ts"], bundle: true, format: "esm", minify: true, write: false, target: "es2022" });
const html = readFileSync("src/view/card.html", "utf8").replace("/*CARD_JS*/", () => js.outputFiles[0].text);
writeFileSync("data/card.html", html);
