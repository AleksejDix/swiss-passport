// Share image (1200×630) per language, used as og:image on every page of that language.
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { STRINGS } from "../../scripts/i18n.js";
import { LANG_IDS } from "../../data.js";

// The font comes in one file per script; each gets its own name so Cyrillic text falls back to it.
const font = (script, weight) => ({
  name: `Golos ${script}`,
  weight,
  style: "normal",
  data: readFileSync(`node_modules/@fontsource/golos-text/files/golos-text-${script}-${weight}-normal.woff`),
});
const FONTS = [font("latin", 400), font("latin", 600), font("cyrillic", 400), font("cyrillic", 600)];

const RED = "#d52b1e";
const el = (type, style, ...children) => ({ type, props: { style: { display: "flex", ...style }, children } });

export function getStaticPaths() {
  return LANG_IDS.map((lang) => ({ params: { lang } }));
}

export async function GET({ params }) {
  const s = STRINGS[params.lang];
  const cross = el("div", { width: 72, height: 72, background: RED, display: "flex", position: "relative" },
    el("div", { position: "absolute", left: 14, top: 29, width: 44, height: 14, background: "#fff" }),
    el("div", { position: "absolute", left: 29, top: 14, width: 14, height: 44, background: "#fff" }));
  const svg = await satori(
    el("div", {
      width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: 72, background: "#fff", color: "#000", fontFamily: "Golos latin, Golos cyrillic",
    },
      el("div", { display: "flex", alignItems: "center", gap: 24, fontSize: 36, fontWeight: 600 }, cross, "Swiss Passport"),
      el("div", { display: "flex", fontSize: 76, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }, s.h1),
      el("div", { display: "flex", fontSize: 32, color: "#767676", borderTop: "4px solid #000", paddingTop: 24 }, `350 ${s.f1}`),
    ),
    { width: 1200, height: 630, fonts: FONTS },
  );
  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
