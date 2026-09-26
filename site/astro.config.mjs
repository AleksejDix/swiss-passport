import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import securityHeaders from "./security-headers.mjs";
import { SITE } from "./src/site.js";

// Static site. The build goes into server/public, which Vercel serves next to the /mcp function.
export default defineConfig({
  site: SITE,
  outDir: "../server/public",
  trailingSlash: "always",
  // Language versions are declared per page with <link rel="alternate" hreflang>; / is the language picker.
  // securityHeaders writes _headers (Content-Security-Policy and more) for Cloudflare after the build.
  integrations: [sitemap(), securityHeaders()],
});
