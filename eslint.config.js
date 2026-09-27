// Lint rules for the whole repository: JavaScript, TypeScript and Astro components.
import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default ts.config(
  {
    ignores: [
      "**/node_modules/",
      "**/.astro/",
      "packages/*/dist/",
      "server/public/",
      "server/dist/",
      "server/data/",
      "server/api/",
      "server/release/",
      "server/.wrangler/",
      "server/scripts/preview/out/",
      "private/",
      "playwright-report/",
      "test-results/",
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  astro.configs.recommended,
  { languageOptions: { globals: globals.node } },
  // Code that runs in the browser: the site's scripts, the quiz card and the e2e page helpers.
  { files: ["site/src/scripts/**", "site/src/**/*.astro", "server/src/view/**"], languageOptions: { globals: globals.browser } },
  {
    rules: {
      // `catch { /* storage unavailable */ }` is the house style for optional browser APIs.
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
    },
  },
);
