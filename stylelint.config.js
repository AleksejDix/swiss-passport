// CSS rules for the site's Swiss design (International Typographic Style). Colours, type sizes and the typeface come
// from the tokens in site/src/styles/tokens.css; two weights; no decorative shadows, no rounded corners on boxes,
// no all-caps text. Shapes that are round by nature (dots, the Federal Council's frame) may use 50% or 999px.
const TOKENS_ONLY = ["/color$/", "fill", "stroke", "background", "font-size", "font-family"];

export default {
  extends: ["stylelint-config-recommended"],
  plugins: ["stylelint-declaration-strict-value"],
  overrides: [{ files: ["**/*.astro"], customSyntax: "postcss-html" }],
  ignoreFiles: ["**/node_modules/**", "mcp/public/**", "**/dist/**", "**/.astro/**", ".claude/**"],
  rules: {
    "scale-unlimited/declaration-strict-value": [
      TOKENS_ONLY,
      {
        ignoreValues: ["currentColor", "transparent", "inherit", "none", "initial", "unset", "0"],
        ignoreFunctions: false,
        message: "Use a token from site/src/styles/tokens.css (var(--…)) for ${property}, not ${value}.",
      },
    ],
    "declaration-property-value-allowed-list": {
      "font-weight": ["400", "700", "inherit"],
      "border-radius": ["0", "50%", "999px"],
      // A ring drawn around a mark (inset or outside), never a blurred shadow.
      "box-shadow": ["none", "/^(inset )?0 0 0 [\\d.]+px var\\(--[a-z-]+\\)$/"],
      "text-transform": ["none"],
      // Only as a halo in the paper colour, so names stay legible over a map.
      "text-shadow": ["none", "/^(0 0 [\\d.]+px var\\(--paper\\),?\\s*)+$/"],
    },
    // In one global stylesheet this rule flagged unrelated selectors; in scoped component styles it only adds noise.
    "no-descending-specificity": null,
    // :global() is how a component styles the elements its script creates or the content of its slot.
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global"] }],
  },
};
