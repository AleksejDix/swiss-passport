// Lint rules for the whole repository: JavaScript, TypeScript and Astro components.
import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default ts.config(
  {
    ignores: [
      "**/node_modules/",
      "**/.astro/",
      "packages/*/dist/",
      "mcp/public/",
      "mcp/dist/",
      "mcp/data/",
      "mcp/api/",
      "mcp/release/",
      "mcp/.wrangler/",
      "mcp/scripts/preview/out/",
      "private/",
      // Other sessions' git worktrees (excluded from git in .git/info/exclude, which ESLint does not read).
      ".claude/",
      "playwright-report/",
      "test-results/",
      "slides/**/vendor/",
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  astro.configs.recommended,
  svelte.configs.recommended,
  // TypeScript inside Svelte components and in .svelte.ts modules (runes).
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: { parserOptions: { parser: ts.parser, extraFileExtensions: [".svelte"] } },
  },
  { languageOptions: { globals: globals.node } },
  // Code that runs in the browser: the site's scripts, the quiz card, the e2e page helpers and the slide decks.
  {
    files: ["site/src/scripts/**", "site/src/**/*.astro", "site/src/learn/**", "mcp/src/view/**", "slides/**"],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
      // `catch { /* storage unavailable */ }` is the house style for optional browser APIs.
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
);
