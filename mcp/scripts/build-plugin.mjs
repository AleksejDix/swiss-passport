// Wraps the Claude Desktop extension (swiss-passport-zh.mcpb, from `mcpb pack`) as a Claude plugin: a zip with
// .claude-plugin/plugin.json next to the bundle. Claude Desktop installs it under Settings → Plugins → Upload custom
// plugin; the same zip works in Claude Code. The plugin manifest is derived from manifest.json, the one source of truth.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const bundle = "swiss-passport-zh.mcpb";
const staging = "plugin-build";

rmSync(staging, { recursive: true, force: true });
mkdirSync(`${staging}/.claude-plugin`, { recursive: true });
writeFileSync(
  `${staging}/.claude-plugin/plugin.json`,
  JSON.stringify(
    {
      name: manifest.name,
      displayName: manifest.display_name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      homepage: "https://swiss-passport.com/en/connect/",
      repository: manifest.repository.url,
      license: manifest.license,
      keywords: manifest.keywords,
      mcpServers: `./${bundle}`,
    },
    null,
    2,
  ) + "\n",
);
cpSync(bundle, `${staging}/${bundle}`);

rmSync("swiss-passport-zh.zip", { force: true });
execFileSync("zip", ["-q", "-r", "../swiss-passport-zh.zip", "."], { cwd: staging, stdio: "inherit" });
rmSync(staging, { recursive: true, force: true });
console.log("Output: swiss-passport-zh.zip");
