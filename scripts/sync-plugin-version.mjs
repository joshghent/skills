#!/usr/bin/env node
// Copies package.json's version into the plugin's plugin.json.
// Runs as part of `npm run version`, immediately after `changeset version`.
// With --check it changes nothing and exits 1 if the two versions differ.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPath = join(repo, "plugins", "joshghent-skills", ".claude-plugin", "plugin.json");

const { version } = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const source = readFileSync(pluginPath, "utf8");
const plugin = JSON.parse(source);

if (plugin.version === version) {
  console.log(`plugin.json version is ${version} (already in sync)`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  console.error(`plugin.json version is ${plugin.version}, package.json is ${version}. Run \`npm run version\`.`);
  process.exit(1);
}

// Rewrite only the version line, to keep key order and formatting.
const updated = source.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`);
writeFileSync(pluginPath, updated);
console.log(`plugin.json version ${plugin.version} -> ${version}`);
