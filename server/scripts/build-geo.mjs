// Builds site/src/viz/geo-data.js: the map of Switzerland and the map of the Canton of Zurich (issues #13, #14).
// Only official data:
// - cantons, lakes, municipalities: Bundesamt für Statistik (BFS), GEOSTAT, via the swiss-maps package (2026)
// - language region of each municipality: BFS, Raumgliederungen der Schweiz, Sprachgebiete (SPRGEB2020)
// - Jura, Plateau, Alps: Bundesamt für Umwelt (BAFU), Biogeographische Regionen der Schweiz
// - rivers: BAFU, Gewässernetz (ch.bafu.vec25-gewaessernetz_2000); Lake Pfäffikon: BAFU, Seen (ch.bafu.vec25-seen)
// - peaks, passes, hills: swisstopo, swissNAMES3D
// The BAFU and swisstopo data come from api3.geo.admin.ch, the language regions from agvchapp.bfs.admin.ch.
// Answers are cached in node_modules/.cache/geo, so a second run works offline.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { feature, merge, neighbors } from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import { geoMercator, geoPath, geoBounds, geoCentroid } from "d3-geo";

const CACHE = new URL("../node_modules/.cache/geo/", import.meta.url);
mkdirSync(CACHE, { recursive: true });

async function cached(name, url) {
  const file = new URL(name, CACHE);
  if (existsSync(file)) return readFileSync(file, "utf8");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  writeFileSync(file, text);
  return text;
}
const api = "https://api3.geo.admin.ch/rest/services/api";
const json = async (name, url) => JSON.parse(await cached(name, url));

// ---- Sources --------------------------------------------------------------------------------

const topo = JSON.parse(readFileSync(new URL("../node_modules/swiss-maps/2026/ch-combined.json", import.meta.url)));

/** BFS language region of every municipality: 1 German, 2 French, 3 Italian, 4 Romansh. */
async function languageRegions() {
  const csv = await cached("levels-2026.csv", "https://www.agvchapp.bfs.admin.ch/api/communes/levels?date=01-01-2026");
  const [head, ...rows] = csv.trim().split("\n").map((l) => l.split(","));
  const bfs = head.indexOf("BfsCode");
  const lang = head.indexOf("SPRGEB2020");
  if (bfs < 0 || lang < 0) throw new Error("levels CSV: BfsCode or SPRGEB2020 missing");
  return new Map(rows.map((r) => [Number(r[bfs]), Number(r[lang])]));
}

/** LV95 (Swiss grid, metres) to WGS84 longitude and latitude, swisstopo's approximate formulas (about 1 m). */
function wgs84(e, n) {
  const y = (e - 2600000) / 1e6;
  const x = (n - 1200000) / 1e6;
  const lon = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3;
  const lat = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.014 * x ** 3;
  return [(lon * 100) / 36, (lat * 100) / 36];
}

/** All features of a geo.admin layer inside an LV95 envelope, 200 per page, in WGS84. */
async function identify(layer, [x0, y0, x1, y1]) {
  const corners = [wgs84(x0, y0), wgs84(x1, y0), wgs84(x0, y1), wgs84(x1, y1)];
  const env = [Math.min(...corners.map((c) => c[0])), Math.min(...corners.map((c) => c[1])), Math.max(...corners.map((c) => c[0])), Math.max(...corners.map((c) => c[1]))];
  const out = [];
  for (let offset = 0; ; offset += 200) {
    const q = new URLSearchParams({
      layers: `all:${layer}`, geometryType: "esriGeometryEnvelope", geometry: env.join(","), sr: "4326",
      tolerance: "0", returnGeometry: "true", geometryFormat: "geojson", limit: "200", offset: String(offset),
    });
    const page = await json(`${layer}-${x0}-${y0}-${x1}-${y1}-${offset}.json`, `${api}/MapServer/identify?${q}`);
    out.push(...page.results);
    if (page.results.length < 200) return out;
  }
}

/** Features of a layer whose name is exactly `name` (the service stops at 201). */
async function find(layer, name) {
  const q = new URLSearchParams({ layer, searchText: name, searchField: "name", contains: "false", returnGeometry: "true", geometryFormat: "geojson", sr: "4326" });
  return (await json(`find-${layer}-${name}.json`, `${api}/MapServer/find?${q}`)).results;
}

const RIVERS = "ch.bafu.vec25-gewaessernetz_2000";
/** A river as lines: found by name, plus envelopes along the parts the name search does not return.
    Stretches through lakes (Seeachse) and underground are left out; the lakes are drawn. */
async function river(name, envelopes = []) {
  const byId = new Map();
  for (const f of await find(RIVERS, name)) byId.set(f.id, f);
  for (const env of envelopes) for (const f of await identify(RIVERS, env)) if (f.properties.name === name) byId.set(f.id, f);
  const lines = [...byId.values()].filter((f) => !/Seeachse|_U$/.test(f.properties.objectval));
  return { type: "MultiLineString", coordinates: lines.flatMap((f) => f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates) };
}

/** A point from swissNAMES3D: the first search hit of the given object type in the given canton. */
async function place(text, kind, canton) {
  const q = new URLSearchParams({ searchText: text, type: "locations", limit: "10", lang: "de" });
  const hits = (await json(`search-${text}.json`, `${api}/SearchServer?${q}`)).results;
  const label = (h) => h.attrs.label.replace(/<[^>]+>/g, "");
  const hit = hits.find((h) => label(h).startsWith(`${kind} ${text}`) && label(h).includes(`(${canton})`));
  if (!hit) throw new Error(`swissNAMES3D: no ${kind} ${text} (${canton})`);
  return [hit.attrs.lon, hit.attrs.lat];
}

// ---- Drawing --------------------------------------------------------------------------------

const W = 1000;
/** A Mercator projection that fits `extent` into W units of width, and the height that results. */
function frame(extent) {
  const projection = geoMercator().fitWidth(W, extent);
  const path = geoPath(projection);
  const [[, y0], [, y1]] = path.bounds(extent);
  projection.translate([projection.translate()[0], projection.translate()[1] - y0]);
  return { projection, height: Math.ceil(y1 - y0) };
}

/** Douglas-Peucker on projected points, so lines and outlines carry no detail below half a unit. */
function thin(points, tolerance = 0.5) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points.at(-1)];
  let max = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const d = dx || dy ? Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / Math.hypot(dx, dy) : Math.hypot(x - a[0], y - a[1]);
    if (d > max) [max, index] = [d, i];
  }
  if (max <= tolerance) return [a, b];
  return [...thin(points.slice(0, index + 1), tolerance).slice(0, -1), ...thin(points.slice(index), tolerance)];
}

/** SVG path data of a GeoJSON geometry, thinned; rings smaller than `minArea` square units are dropped. */
function draw(projection, geometry, { closed = true, minArea = 0 } = {}) {
  const lines = { Polygon: [geometry.coordinates], MultiPolygon: geometry.coordinates, LineString: [[geometry.coordinates]], MultiLineString: [geometry.coordinates] }[geometry.type];
  const parts = [];
  for (const shape of lines) {
    for (const ring of shape) {
      const pts = thin(ring.map((p) => projection(p)));
      if (closed) {
        const area = Math.abs(pts.reduce((s, [x, y], i) => { const [u, v] = pts[(i + 1) % pts.length]; return s + x * v - u * y; }, 0)) / 2;
        if (pts.length < 4 || area < minArea) continue;
      }
      parts.push(pts.map(([x, y], i) => `${i ? "L" : "M"}${Math.round(x)} ${Math.round(y)}`).join("").replace(/L(-?\d+ -?\d+)(?=L\1)/g, "") + (closed ? "Z" : ""));
    }
  }
  return parts.join("");
}

const point = (projection, lonlat) => projection(lonlat).map((n) => Math.round(n * 10) / 10);

// ---- Switzerland ----------------------------------------------------------------------------

const ABBR = ["ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR", "SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG", "TI", "VD", "VS", "NE", "GE", "JU"];
const simple = simplify(presimplify(topo), 1e-4);
const country = feature(simple, simple.objects.country);
const ch = frame(country);
const pCH = ch.projection;
const muniCentre = (() => {
  const all = feature(topo, topo.objects.municipalities).features;
  return (id) => all.find((f) => f.id === id);
})();

const cantons = feature(simple, simple.objects.cantons).features.map((f) => ({ abbr: ABBR[f.id - 1], d: draw(pCH, f.geometry, { minArea: 4 }) }));
const lakes = feature(simple, simple.objects.lakes).features.map((f) => draw(pCH, f.geometry, { minArea: 40 })).filter(Boolean);

// Language regions: the municipalities of each region merged into one outline.
const langOf = await languageRegions();
const munis = simple.objects.municipalities.geometries;
// Areas that belong to no municipality (a state forest, shared areas in Ticino) take the language around them.
const missing = munis.filter((g) => !langOf.has(g.id));
if (missing.length > 3) throw new Error(`${missing.length} municipalities without a language region`);
const around = neighbors(munis);
for (const g of missing) {
  const codes = around[munis.indexOf(g)].map((i) => langOf.get(munis[i].id)).filter(Boolean);
  const top = codes.sort((a, b) => codes.filter((c) => c === b).length - codes.filter((c) => c === a).length)[0];
  if (!top) throw new Error(`no language around ${g.id}`);
  langOf.set(g.id, top);
}
const LANG_CODES = { de: 1, fr: 2, it: 3, rm: 4 };
const languages = Object.fromEntries(Object.entries(LANG_CODES).map(([id, code]) =>
  [id, draw(pCH, merge(simple, munis.filter((g) => langOf.get(g.id) === code)), { minArea: 4 })]));

// Jura, Plateau, Alps: the BAFU regions, the four Alpine regions together.
const bio = await identify("ch.bafu.biogeographische_regionen", [2480000, 1070000, 2840000, 1300000]);
const area = (names) => bio.filter((f) => names.includes(f.properties.regionname_de));
const regionShares = (() => {
  const ha = (fs) => fs.reduce((s, f) => s + f.properties.area, 0);
  const all = ha(bio);
  return { jura: ha(area(["Jura"])) / all, plateau: ha(area(["Mittelland"])) / all };
})();
const ALPS = ["Alpennordflanke", "Westliche Zentralalpen", "Östliche Zentralalpen", "Alpensüdflanke"];
const regions = {
  jura: area(["Jura"]).map((f) => draw(pCH, f.geometry, { minArea: 4 })).join(""),
  alps: area(ALPS).map((f) => draw(pCH, f.geometry, { minArea: 4 })).join(""),
};

// Rhine and Rhone: the name search stops at 201 pieces and large envelopes are cut off without notice,
// so the valleys are read in tiles of 10 km (LV95). The Vorderrhein is named "Rhein" in this data.
const tiles = ([x0, y0, x1, y1], size = 10000) => {
  const out = [];
  for (let x = x0; x < x1; x += size) for (let y = y0; y < y1; y += size) out.push([x, y, Math.min(x + size, x1), Math.min(y + size, y1)]);
  return out;
};
const rhine = await river("Rhein", [
  [2690000, 1160000, 2750000, 1192000], // Vorderrhein, from the source to Reichenau
  [2745000, 1180000, 2780000, 1270000], // Chur to Lake Constance
  [2605000, 1255000, 2710000, 1300000], // Stein am Rhein to Basel
].flatMap((c) => tiles(c)));
const rhone = await river("Rhône", [
  [2485000, 1105000, 2505000, 1125000], // Geneva
  [2550000, 1100000, 2575000, 1140000], // Lake Geneva to Martigny
  [2570000, 1100000, 2645000, 1135000], // Martigny to Brig
  [2640000, 1125000, 2675000, 1162000], // Brig to the Rhone Glacier
].flatMap((c) => tiles(c)));

const cityCentre = (id) => point(pCH, geoCentroid(muniCentre(id)));
/** Scale and translation of a d3 Mercator projection, so the site can place labels by longitude and latitude. */
const params = (p) => ({ scale: p.scale(), translate: p.translate() });
const CH = {
  width: W,
  height: ch.height,
  projection: params(pCH),
  outline: country.features.map((f) => draw(pCH, f.geometry, { minArea: 4 })).join(""),
  cantons,
  lakes,
  languages,
  regions,
  rivers: { rhine: draw(pCH, rhine, { closed: false }), rhone: draw(pCH, rhone, { closed: false }) },
  points: {
    zurich: cityCentre(261), geneva: cityCentre(6621), basel: cityCentre(2701), lausanne: cityCentre(5586), bern: cityCentre(351),
    dufour: point(pCH, await place("Dufourspitze", "Alpiner Gipfel", "VS")),
    gotthard: point(pCH, await place("Gotthardpass", "Pass", "TI")),
    simplon: point(pCH, await place("Simplonpass", "Pass", "VS")),
    bernhard: point(pCH, await place("Grosser St. Bernhard", "Pass", "VS")),
  },
};

// ---- Canton of Zurich -----------------------------------------------------------------------

const fine = simplify(presimplify(topo), 2e-6);
const zhFeature = feature(fine, fine.objects.cantons).features.find((f) => f.id === 1);
const [[lon0, lat0], [lon1, lat1]] = geoBounds(zhFeature);
const padX = (lon1 - lon0) * 0.1;
const padY = (lat1 - lat0) * 0.1;
// Clockwise, as d3 reads rings on the sphere; the other direction would be the whole world outside.
const view = { type: "Polygon", coordinates: [[[lon0 - padX, lat0 - padY], [lon0 - padX, lat1 + padY], [lon1 + padX, lat1 + padY], [lon1 + padX, lat0 - padY], [lon0 - padX, lat0 - padY]]] };
const zh = frame(view);
const pZH = zh.projection;
const inView = (f) => { const [[a, b], [c, d]] = geoBounds(f); return a < lon1 + padX && c > lon0 - padX && b < lat1 + padY && d > lat0 - padY; };
const zhCantons = feature(fine, fine.objects.cantons).features.filter(inView).map((f) => ({ abbr: ABBR[f.id - 1], d: draw(pZH, f.geometry, { minArea: 2 }) }));
// The BFS lakes stop at Lake Greifen; Lake Pfäffikon (3.3 km²) comes from the BAFU lakes, under the same lake number.
const pfaeffikon = (await identify("ch.bafu.vec25-seen", [2695000, 1240000, 2705000, 1250000])).find((f) => f.properties.name === "Pfäffikersee");
if (!pfaeffikon) throw new Error("BAFU: Pfäffikersee not found");
const zhLakes = [...feature(fine, fine.objects.lakes).features.filter(inView), { id: pfaeffikon.properties.gewaesserkennzahl, geometry: pfaeffikon.geometry, type: "Feature" }]
  .map((f) => draw(pZH, f.geometry, { minArea: 20 }));
const zhCentre = (id) => point(pZH, geoCentroid(muniCentre(id)));
const ZH = {
  width: W,
  height: zh.height,
  projection: params(pZH),
  cantons: zhCantons,
  lakes: zhLakes,
  rivers: {
    rhine: draw(pZH, rhine, { closed: false }),
    limmat: draw(pZH, await river("Limmat"), { closed: false }),
    sihl: draw(pZH, await river("Sihl"), { closed: false }),
    toss: draw(pZH, await river("Töss"), { closed: false }),
  },
  points: {
    zurich: zhCentre(261), winterthur: zhCentre(230), uster: zhCentre(198), kloten: zhCentre(62),
    uetliberg: point(pZH, await place("Uetliberg", "Huegel", "ZH")),
    albis: point(pZH, await place("Albishorn", "Haupthuegel", "ZH")),
    pfannenstiel: point(pZH, await place("Pfannenstiel", "Turm", "ZH")),
    schnebelhorn: point(pZH, await place("Schnebelhorn", "Gipfel", "ZH")),
  },
};

const out = `// Generated by server/scripts/build-geo.mjs. Geodata: BFS (GEOSTAT, Sprachgebiete), BAFU, swisstopo.
export const CH = ${JSON.stringify(CH)};
export const ZH = ${JSON.stringify(ZH)};
`;
writeFileSync(new URL("../../site/src/viz/geo-data.js", import.meta.url), out);
console.log(`geo-data.js: CH ${CH.width}x${CH.height}, ZH ${ZH.width}x${ZH.height}, ${(out.length / 1024).toFixed(0)} KB;`,
  `${zhLakes.length} lakes in the Zurich view; filled from neighbours: ${missing.map((g) => `${g.id}=${langOf.get(g.id)}`).join(" ") || "none"};`,
  `Jura ${(regionShares.jura * 100).toFixed(1)} %, Plateau ${(regionShares.plateau * 100).toFixed(1)} %`);
