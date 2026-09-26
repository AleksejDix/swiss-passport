import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/site.js";

// Static site. The build goes into server/public, which Vercel serves next to the /mcp function.
export default defineConfig({
  site: SITE,
  outDir: "../server/public",
  trailingSlash: "always",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", de: "de", fr: "fr", it: "it", ru: "ru", uk: "uk" },
      },
    }),
  ],
});
