// The maps of the geography topics as shared, cacheable SVG files (issues #13, #14): areas and lines only,
// the labels are HTML in the page language (components/topics/GeoMap.astro).
import { MAP_NAMES, mapSvg } from "../../viz/maps.js";

export const getStaticPaths = () => MAP_NAMES.map((map) => ({ params: { map } }));

export function GET({ params }) {
  return new Response(mapSvg(params.map), { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
}
