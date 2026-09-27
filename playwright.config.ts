// End-to-end tests of the site against the real Worker: static pages, /mcp and D1 run locally in wrangler dev,
// with the same Content-Security-Policy headers as production.
//   npm run test:e2e             how the site behaves (also in CI)
//   npm run test:visual:update   screenshots of the current site as the reference (local only, see e2e/visual.spec.ts)
//   npm run test:visual          compares the site with the reference, pixel by pixel
import { defineConfig, devices } from "@playwright/test";

const PORT = 8787;
const visual = (name: string, width: number, height: number) => ({
  name: `visual-${name}`,
  testMatch: "visual.spec.ts",
  use: { ...devices["Desktop Chrome"], viewport: { width, height }, reducedMotion: "reduce" as const },
});

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } },
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", locale: "en-GB" },
  projects: [
    { name: "e2e", testIgnore: "visual.spec.ts", use: { ...devices["Desktop Chrome"] } },
    visual("phone", 390, 844),
    visual("tablet", 820, 1180),
    visual("desktop", 1280, 900),
  ],
  webServer: {
    // Builds the server and the site, applies the D1 migrations locally and starts the Worker.
    command: "npm --prefix mcp run dev:worker",
    url: `http://localhost:${PORT}/de/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
