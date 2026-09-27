// Share image (1200×630) per language, used as og:image on every page of that language.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { STRINGS } from "../../scripts/i18n.ts";
import { LANG_IDS } from "../../data.ts";

// Satori reads static fonts only, so the image uses the static cuts of Inter, the typeface of the site.
// The font comes in one file per script; each gets its own name so Cyrillic text falls back to it.
// Resolved like an import, so it works wherever npm put the package (the monorepo installs at the root).
const require = createRequire(import.meta.url);
const font = (script, weight) => ({
  name: `Inter ${script}`,
  weight,
  style: "normal",
  data: readFileSync(require.resolve(`@fontsource/inter/files/inter-${script}-${weight}-normal.woff`)),
});
const FONTS = [font("latin", 400), font("latin", 700), font("cyrillic", 400), font("cyrillic", 700)];

const RED = "#da291c"; // Pantone 485 C, the red of the Swiss flag
const el = (type, style, ...children) => ({ type, props: { style: { display: "flex", ...style }, children } });

export function getStaticPaths() {
  return LANG_IDS.map((lang) => ({ params: { lang } }));
}

export async function GET({ params }) {
  const s = STRINGS[params.lang];
  // The flag on a 32-unit square scaled by 2: arms 12 wide and 14 long (a sixth longer than wide), 12 from the edge.
  const cross = el(
    "div",
    { width: 64, height: 64, background: RED, position: "relative" },
    el("div", { position: "absolute", left: 12, top: 26, width: 40, height: 12, background: "#fff" }),
    el("div", { position: "absolute", left: 26, top: 12, width: 12, height: 40, background: "#fff" }),
  );
  const svg = await satori(
    el(
      "div",
      {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#fff",
        color: "#000",
        fontFamily: "Inter latin, Inter cyrillic",
      },
      el(
        "div",
        { alignItems: "center", gap: 24, fontSize: 36, fontWeight: 700, letterSpacing: -0.5 },
        cross,
        "Swiss Passport",
      ),
      el("div", { fontSize: 84, fontWeight: 700, lineHeight: 0.96, letterSpacing: -3.4, maxWidth: 1056 }, s.h1),
      el("div", { fontSize: 30, color: "#6b6b6b", borderTop: "3px solid #000", paddingTop: 21 }, `350 ${s.f1}`),
    ),
    { width: 1200, height: 630, fonts: FONTS },
  );
  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
