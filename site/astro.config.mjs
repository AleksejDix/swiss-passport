import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import securityHeaders from "./security-headers.mjs";
import { lastmodFor } from "./lastmod.mjs";
import { SITE } from "./src/site.ts";
import { LANGUAGES } from "../i18n/index.js";

// Static site. The build goes into mcp/public, which the Cloudflare Worker serves next to /mcp.
// When each page's content last changed (git history), for <lastmod> in the sitemap.
const lastmod = lastmodFor(LANGUAGES);

export default defineConfig({
  site: SITE,
  outDir: "../mcp/public",
  trailingSlash: "always",
  // Language versions are declared per page with <link rel="alternate" hreflang>; / is the language picker.
  // securityHeaders writes _headers (Content-Security-Policy and more) for Cloudflare after the build.
  integrations: [
    sitemap({
      serialize(item) {
        const date = lastmod(new URL(item.url).pathname);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    securityHeaders(),
  ],
});
