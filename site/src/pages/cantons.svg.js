// The canton map as one shared, cacheable SVG file for the majority-of-the-cantons figure (issue #8):
// full cantons grey, the six former half-cantons red. Geodata: BFS, GEOSTAT (via scripts/map-data.js).
import { MAP } from "../scripts/map-data.js";

export function GET() {
  const cantons = MAP.cantons
    .map((c) => `<path class="${c.half ? "c h" : "c"}" d="${c.d}"><title>${c.abbr}</title></path>`)
    .join("");
  const lakes = MAP.lakes.map((d) => `<path class="l" d="${d}"/>`).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP.width} ${MAP.height}">` +
    `<style>.c{fill:#c4c4c4;stroke:#fff;stroke-width:1.5;stroke-linejoin:round}.h{fill:#da291c}.l{fill:#fff}</style>` +
    `${cantons}${lakes}</svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
}
