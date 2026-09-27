// Pictures and the quiz card: files on disk (Claude Desktop, Mac server) or static assets (Cloudflare Worker).
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface Assets {
  /** A picture from the quiz, e.g. "images/karte_zh_a.png", base64-encoded. */
  image(path: string): Promise<string>;
  /** The quiz card (MCP app view) as one self-contained HTML file. */
  card(): Promise<string>;
}

/** Reads from the data folder next to the compiled files (copied there by the build). */
export function fileAssets(): Assets {
  const here = dirname(fileURLToPath(import.meta.url));
  const dir = [join(here, "..", "data"), join(process.cwd(), "data")].find((d) => existsSync(join(d, "card.html")));
  if (!dir) throw new Error("data/card.html not found: run npm run build first.");
  return {
    image: async (path) => readFileSync(join(dir, path)).toString("base64"),
    card: async () => readFileSync(join(dir, "card.html"), "utf8"),
  };
}
