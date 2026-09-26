import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/site.js";

// Static site. The build goes into server/public, which Vercel serves next to the /mcp function.
export default defineConfig({
  site: SITE,
  outDir: "../server/public",
  trailingSlash: "always",
  // Language versions are declared per page with <link rel="alternate" hreflang>; / is the language picker.
  integrations: [sitemap()],
});
