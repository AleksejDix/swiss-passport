// Security headers for every page, written to _headers (Cloudflare static assets) after the build.
// The Content-Security-Policy only lets scripts from this site and from Cloudflare Web Analytics run.
// The few inline scripts (language memory, motion switch) are allowed by their SHA-256 hashes, taken
// from the built pages, so the policy always matches what was built. CSP_REPORT_ONLY=1 sends the policy
// as Content-Security-Policy-Report-Only: the browser reports violations in the console but blocks nothing.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Cloudflare Web Analytics (see the privacy policy): the script it injects and where the script reports.
const ANALYTICS_SCRIPT = "https://static.cloudflareinsights.com";
const ANALYTICS_REPORT = "https://cloudflareinsights.com";

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

/** Hashes of the inline scripts in the built pages. JSON data blocks (JSON-LD) do not run and are skipped. */
async function inlineScriptHashes(dir) {
  const hashes = new Set();
  for await (const file of htmlFiles(dir)) {
    const html = await readFile(file, "utf8");
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs) || /\btype="application\/(ld\+)?json"/.test(attrs)) continue;
      hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
    }
  }
  return [...hashes].sort();
}

export default function securityHeaders() {
  return {
    name: "security-headers",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const hashes = await inlineScriptHashes(out);
        const csp = [
          "default-src 'self'",
          ["script-src 'self'", ANALYTICS_SCRIPT, ...hashes].join(" "),
          // Style attributes place the marks of the review timeline and the method charts.
          "style-src 'self' 'unsafe-inline'",
          // Question pictures in /learn arrive as data: URLs from /mcp.
          "img-src 'self' data:",
          `connect-src 'self' ${ANALYTICS_REPORT}`,
          "object-src 'none'",
          "base-uri 'none'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join("; ");
        // Cloudflare ignores header lines longer than 2000 characters: fail the build instead.
        if (csp.length > 1900)
          throw new Error(`Content-Security-Policy is ${csp.length} characters; move inline scripts into files`);
        const name = process.env.CSP_REPORT_ONLY ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
        const rules = [
          "/*",
          `  ${name}: ${csp}`,
          "  X-Frame-Options: DENY",
          "  Referrer-Policy: strict-origin-when-cross-origin",
          "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          // Files in /_astro/ carry a hash of their content in the name, so they never change: cache them for a year.
          "/_astro/*",
          "  Cache-Control: public, max-age=31536000, immutable",
          "",
        ];
        await writeFile(join(out, "_headers"), rules.join("\n"));
        logger.info(`_headers: ${name} with ${hashes.length} inline script hashes`);
      },
    },
  };
}
