// The maps of the geography topics (issues #13, #14): which topic shows which map, the map as an SVG file
// (areas and lines only, the same in every language) and the marks and labels that the page lays over it
// in the reader's language. Geometry: src/viz/geo-data.js (server/scripts/build-geo.mjs).
import { CH, ZH } from "./geo-data.js";

export const MAP_OF_TOPIC = {
  regions: "ch-regions",
  neighbours: "ch-neighbours",
  size: "ch-size",
  cities: "ch-cities",
  mountains: "ch-mountains",
  rivers: "ch-rivers",
  national_languages: "ch-languages",
  language_regions: "ch-languages",
  zh_location: "zh-location",
  zh_cities: "zh-cities",
  zh_waters: "zh-waters",
};
export const MAP_NAMES = [...new Set(Object.values(MAP_OF_TOPIC))];
export const geometry = (name) => (name.startsWith("zh") ? ZH : CH);

// Names as the explanations of each language write them.
export const MAP_TEXT = {
  de: {
    map: "Karte", credit: "Geodaten: BFS, BAFU, swisstopo", km: "km",
    de: "Deutschland", at: "Österreich", li: "Liechtenstein", it: "Italien", fr: "Frankreich",
    zurich: "Zürich", geneva: "Genf", basel: "Basel", lausanne: "Lausanne", bern: "Bern",
    winterthur: "Winterthur", uster: "Uster", kloten: "Kloten", airport: "Flughafen",
    VS: "Wallis", GR: "Graubünden", UR: "Uri", TI: "Tessin", ZH: "Zürich",
    SH: "Schaffhausen", TG: "Thurgau", SG: "St. Gallen", SZ: "Schwyz", ZG: "Zug", AG: "Aargau",
    rhine: "Rhein", rhone: "Rhone", limmat: "Limmat", sihl: "Sihl", toss: "Töss",
    northSea: "Nordsee", mediterranean: "Mittelmeer",
    lakeZurich: "Zürichsee", lakeGreifen: "Greifensee", lakePfaeffikon: "Pfäffikersee",
    uetliberg: "Uetliberg", albis: "Albis", pfannenstiel: "Pfannenstiel", schnebelhorn: "Schnebelhorn",
    gotthard: "Gotthard", simplon: "Simplon", bernhard: "Grosser Sankt Bernhard", dufour: "Dufourspitze",
    jura: "Jura", plateau: "Mittelland", alps: "Alpen",
    german: "Deutsch", french: "Französisch", italian: "Italienisch", romansh: "Rätoromanisch",
  },
  en: {
    map: "Map", credit: "Map data: BFS, BAFU, swisstopo", km: "km",
    de: "Germany", at: "Austria", li: "Liechtenstein", it: "Italy", fr: "France",
    zurich: "Zurich", geneva: "Geneva", basel: "Basel", lausanne: "Lausanne", bern: "Bern",
    winterthur: "Winterthur", uster: "Uster", kloten: "Kloten", airport: "airport",
    VS: "Valais", GR: "Graubünden", UR: "Uri", TI: "Ticino", ZH: "Zurich",
    SH: "Schaffhausen", TG: "Thurgau", SG: "St. Gallen", SZ: "Schwyz", ZG: "Zug", AG: "Aargau",
    rhine: "Rhine", rhone: "Rhone", limmat: "Limmat", sihl: "Sihl", toss: "Töss",
    northSea: "North Sea", mediterranean: "Mediterranean",
    lakeZurich: "Lake Zurich", lakeGreifen: "Lake Greifen", lakePfaeffikon: "Lake Pfäffikon",
    uetliberg: "Uetliberg", albis: "Albis", pfannenstiel: "Pfannenstiel", schnebelhorn: "Schnebelhorn",
    gotthard: "Gotthard", simplon: "Simplon", bernhard: "Great St Bernard", dufour: "Dufourspitze",
    jura: "Jura", plateau: "Plateau", alps: "Alps",
    german: "German", french: "French", italian: "Italian", romansh: "Romansh",
  },
  fr: {
    map: "Carte", credit: "Géodonnées : OFS, OFEV, swisstopo", km: "km",
    de: "Allemagne", at: "Autriche", li: "Liechtenstein", it: "Italie", fr: "France",
    zurich: "Zurich", geneva: "Genève", basel: "Bâle", lausanne: "Lausanne", bern: "Berne",
    winterthur: "Winterthour", uster: "Uster", kloten: "Kloten", airport: "aéroport",
    VS: "Valais", GR: "Grisons", UR: "Uri", TI: "Tessin", ZH: "Zurich",
    SH: "Schaffhouse", TG: "Thurgovie", SG: "Saint-Gall", SZ: "Schwytz", ZG: "Zoug", AG: "Argovie",
    rhine: "Rhin", rhone: "Rhône", limmat: "Limmat", sihl: "Sihl", toss: "Töss",
    northSea: "mer du Nord", mediterranean: "Méditerranée",
    lakeZurich: "lac de Zurich", lakeGreifen: "lac de Greifen", lakePfaeffikon: "lac de Pfäffikon",
    uetliberg: "Uetliberg", albis: "Albis", pfannenstiel: "Pfannenstiel", schnebelhorn: "Schnebelhorn",
    gotthard: "Gothard", simplon: "Simplon", bernhard: "Grand-Saint-Bernard", dufour: "pointe Dufour",
    jura: "Jura", plateau: "Plateau", alps: "Alpes",
    german: "allemand", french: "français", italian: "italien", romansh: "romanche",
  },
  it: {
    map: "Carta", credit: "Geodati: UST, UFAM, swisstopo", km: "km",
    de: "Germania", at: "Austria", li: "Liechtenstein", it: "Italia", fr: "Francia",
    zurich: "Zurigo", geneva: "Ginevra", basel: "Basilea", lausanne: "Losanna", bern: "Berna",
    winterthur: "Winterthur", uster: "Uster", kloten: "Kloten", airport: "aeroporto",
    VS: "Vallese", GR: "Grigioni", UR: "Uri", TI: "Ticino", ZH: "Zurigo",
    SH: "Sciaffusa", TG: "Turgovia", SG: "San Gallo", SZ: "Svitto", ZG: "Zugo", AG: "Argovia",
    rhine: "Reno", rhone: "Rodano", limmat: "Limmat", sihl: "Sihl", toss: "Töss",
    northSea: "Mare del Nord", mediterranean: "Mediterraneo",
    lakeZurich: "lago di Zurigo", lakeGreifen: "lago di Greifen", lakePfaeffikon: "lago di Pfäffikon",
    uetliberg: "Uetliberg", albis: "Albis", pfannenstiel: "Pfannenstiel", schnebelhorn: "Schnebelhorn",
    gotthard: "San Gottardo", simplon: "Sempione", bernhard: "Gran San Bernardo", dufour: "Punta Dufour",
    jura: "Giura", plateau: "Altopiano", alps: "Alpi",
    german: "tedesco", french: "francese", italian: "italiano", romansh: "romancio",
  },
  ru: {
    map: "Карта", credit: "Геоданные: BFS, BAFU, swisstopo", km: "км",
    de: "Германия", at: "Австрия", li: "Лихтенштейн", it: "Италия", fr: "Франция",
    zurich: "Цюрих", geneva: "Женева", basel: "Базель", lausanne: "Лозанна", bern: "Берн",
    winterthur: "Винтертур", uster: "Устер", kloten: "Клотен", airport: "аэропорт",
    VS: "Вале", GR: "Граубюнден", UR: "Ури", TI: "Тичино", ZH: "Цюрих",
    SH: "Шаффхаузен", TG: "Тургау", SG: "Санкт-Галлен", SZ: "Швиц", ZG: "Цуг", AG: "Аргау",
    rhine: "Рейн", rhone: "Рона", limmat: "Лиммат", sihl: "Зиль", toss: "Тёсс",
    northSea: "Северное море", mediterranean: "Средиземное море",
    lakeZurich: "Цюрихское озеро", lakeGreifen: "Грайфензе", lakePfaeffikon: "Пфеффикерзе",
    uetliberg: "Ютлиберг", albis: "Альбис", pfannenstiel: "Пфанненштиль", schnebelhorn: "Шнебельхорн",
    gotthard: "Готард", simplon: "Симплон", bernhard: "Большой Сен-Бернар", dufour: "пик Дюфур",
    jura: "Юра", plateau: "Швейцарское плато", alps: "Альпы",
    german: "немецкий", french: "французский", italian: "итальянский", romansh: "ретороманский",
  },
  uk: {
    map: "Мапа", credit: "Геодані: BFS, BAFU, swisstopo", km: "км",
    de: "Німеччина", at: "Австрія", li: "Ліхтенштейн", it: "Італія", fr: "Франція",
    zurich: "Цюрих", geneva: "Женева", basel: "Базель", lausanne: "Лозанна", bern: "Берн",
    winterthur: "Вінтертур", uster: "Устер", kloten: "Клотен", airport: "аеропорт",
    VS: "Вале", GR: "Граубюнден", UR: "Урі", TI: "Тічино", ZH: "Цюрих",
    SH: "Шаффгаузен", TG: "Тургау", SG: "Санкт-Галлен", SZ: "Швіц", ZG: "Цуг", AG: "Аргау",
    rhine: "Рейн", rhone: "Рона", limmat: "Ліммат", sihl: "Зіль", toss: "Тесс",
    northSea: "Північне море", mediterranean: "Середземне море",
    lakeZurich: "Цюрихське озеро", lakeGreifen: "Грайфенське озеро", lakePfaeffikon: "Пфеффікерське озеро",
    uetliberg: "Ютліберг", albis: "Альбіс", pfannenstiel: "Пфанненштіль", schnebelhorn: "Шнебельгорн",
    gotthard: "Готард", simplon: "Сімплон", bernhard: "Великий Сен-Бернар", dufour: "пік Дюфур",
    jura: "Юра", plateau: "Швейцарське плато", alps: "Альпи",
    german: "німецька", french: "французька", italian: "італійська", romansh: "ретороманська",
  },
};

/** Map units of a longitude and latitude (the Mercator projection of the build script). */
function project(geo, [lon, lat]) {
  const { scale, translate } = geo.projection;
  const rad = Math.PI / 180;
  return [translate[0] + scale * lon * rad, translate[1] - scale * Math.log(Math.tan(Math.PI / 4 + (lat * rad) / 2))];
}

// Fills: the field grey is the rest of the country, light grey what the map is about, the red the answer.
const FIELD = "#e8e8e8";
const LIGHT = "#c4c4c4";
const DARK = "#8f8f8f";
const RED = "#da291c";

/** The SVG file of a map: areas and lines only, so one file serves all languages. */
export function mapSvg(name) {
  const g = geometry(name);
  const fill = (d, color) => (d ? `<path d="${d}" fill="${color}"/>` : "");
  const line = (d, color, width) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  const canton = (abbr) => g.cantons.find((c) => c.abbr === abbr).d;
  const borders = (color, width) => line(g.cantons.map((c) => c.d).join(""), color, width);
  const lakes = g.lakes.map((d) => fill(d, "#fff")).join("");
  let body;
  if (g === CH) {
    const layer = {
      "ch-regions": fill(CH.regions.jura, LIGHT) + fill(CH.regions.alps, DARK),
      "ch-languages": fill(CH.languages.fr, LIGHT) + fill(CH.languages.it, DARK) + fill(CH.languages.rm, RED),
      "ch-size": fill(canton("GR"), RED),
      "ch-mountains": ["VS", "GR", "UR", "TI"].map((a) => fill(canton(a), LIGHT)).join(""),
    }[name] ?? "";
    const top = {
      "ch-rivers": line(CH.rivers.rhine, "#000", 2) + line(CH.rivers.rhone, "#000", 2),
      "ch-neighbours": line(CH.outline, "#000", 2),
    }[name] ?? "";
    body = fill(CH.outline, FIELD) + layer + borders("#fff", 1) + lakes + top;
  } else {
    const zh = name === "zh-location" ? RED : LIGHT;
    const cantons = ZH.cantons.map((c) => fill(c.d, c.abbr === "ZH" ? zh : FIELD)).join("");
    const rivers = name === "zh-waters" ? Object.values(ZH.rivers).map((d) => line(d, "#000", 1.5)).join("")
      : name === "zh-location" ? line(ZH.rivers.rhine, "#000", 1.5) : "";
    body = cantons + borders("#fff", 1) + lakes + rivers;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}">${body}</svg>`;
}

// Marks: [kind, position, text key, where the label goes, emphasis]. Kinds: dot, square (seat of government),
// diamond (pass), peak, area (a label on a surface), place (a name without a mark). Positions are
// [longitude, latitude] or a point of the build script. Label sides: e, w, n, s, c (centred), ne and se (above or
// below, to the right); "wrap" lets a long name take two lines. The places are chosen so that no names touch at 375 px.
const P = (key) => ({ point: key });
const MARKS = {
  "ch-regions": [["area", [6.72, 46.93], "jura", "c"], ["area", [7.55, 47.13], "plateau", "c"], ["area", [8.55, 46.62], "alps", "c"]],
  "ch-neighbours": [
    ["place", [8.08, 47.74], "de", "c"], ["place", [6.25, 47.2], "fr", "c"], ["place", [8.05, 45.92], "it", "c"],
    ["place", [10.2, 47.52], "at", "c"], ["dot", [9.55, 47.14], "li", "s"],
  ],
  "ch-size": [["area", [9.6, 46.68], "GR", "c", true]],
  "ch-cities": [
    ["dot", P("zurich"), "zurich", "e", true, 1], ["dot", P("geneva"), "geneva", "e", false, 2], ["dot", P("basel"), "basel", "e", false, 3],
    ["dot", P("lausanne"), "lausanne", "n", false, 4], ["square", P("bern"), "bern", "e", false, 5],
  ],
  "ch-mountains": [
    ["area", [7.65, 46.35], "VS", "c"], ["area", [9.65, 46.72], "GR", "c"], ["area", [8.63, 46.82], "UR", "c"], ["area", [9.02, 46.12], "TI", "c"],
    ["diamond", P("gotthard"), "gotthard", "e"], ["diamond", P("simplon"), "simplon", "ne"], ["diamond", P("bernhard"), "bernhard", "n wrap"],
    ["peak", P("dufour"), "dufour", "e", true],
  ],
  "ch-rivers": [
    ["place", [8.25, 47.62], "rhine", "s"], ["place", [7.59, 47.57], "northSea", "w", true],
    ["place", [7.5, 46.25], "rhone", "s"], ["place", [5.97, 46.16], "mediterranean", "se", true],
  ],
  "ch-languages": [],
  "zh-location": [
    ["area", [8.67, 47.43], "ZH", "c", true], ["place", [8.62, 47.715], "SH", "c"], ["place", [8.97, 47.6], "TG", "c"], ["place", [8.93, 47.24], "SG", "c"],
    ["place", [8.77, 47.14], "SZ", "c"], ["place", [8.5, 47.14], "ZG", "c"], ["place", [8.36, 47.42], "AG", "c"], ["place", [8.36, 47.66], "de", "c"],
  ],
  "zh-cities": [
    ["square", P("zurich"), "zurich", "e", true, 1], ["dot", P("winterthur"), "winterthur", "e", false, 2], ["dot", P("uster"), "uster", "e", false, 3],
    ["dot", P("kloten"), "kloten", "e"],
  ],
  "zh-waters": [
    ["place", [8.7, 47.225], "lakeZurich", "c", true], ["place", [8.68, 47.378], "lakeGreifen", "n", true], ["place", [8.8, 47.36], "lakePfaeffikon", "e", true],
    ["place", [8.4, 47.425], "limmat", "n", true], ["place", [8.535, 47.3], "sihl", "w", true], ["place", [8.86, 47.43], "toss", "e", true],
    ["peak", P("uetliberg"), "uetliberg", "w"], ["peak", P("albis"), "albis", "w"], ["peak", P("pfannenstiel"), "pfannenstiel", "e"],
    ["peak", P("schnebelhorn"), "schnebelhorn", "w"],
  ],
};

/** The marks of a map in one language, with positions in percent of the map. */
export function mapMarks(name, lang) {
  const g = geometry(name);
  const t = MAP_TEXT[lang];
  return MARKS[name].map(([kind, at, key, side, strong = false, rank]) => {
    const [x, y] = at.point ? g.points[at.point] : project(g, at);
    let text = t[key];
    if (key === "kloten") text = `${t.kloten} (${t.airport})`;
    if (key === "dufour") text = `${t.dufour} 4634 m`;
    // Which way the water leaves the country: north at Basel, south-west at Geneva.
    if (key === "northSea") text = `↑ ${t[key]}`;
    if (key === "mediterranean") text = `↙ ${t[key]}`;
    return { kind, x: (x / g.width) * 100, y: (y / g.height) * 100, text, side, strong, rank };
  });
}

// Legends: the shape or fill, and its name. Names of fills and marks are key terms of the topic.
export const MAP_LEGEND = {
  "ch-cities": [["square", "cities", "Bundesstadt"]],
  "ch-mountains": [["diamond", "mountains", "Alpenpass"], ["light", "mountains", "Bergkanton"]],
  "ch-languages": [["field", "german"], ["light", "french"], ["dark", "italian"], ["red", "romansh"]],
  "zh-cities": [["square", "zh_cities", "Hauptort"]],
};
