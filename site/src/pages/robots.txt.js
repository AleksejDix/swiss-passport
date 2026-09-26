// robots.txt: everything may be crawled, including by AI assistants; points to the sitemap.
import { SITE } from "../site.js";

export function GET() {
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${new URL("/sitemap-index.xml", SITE).href}`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
