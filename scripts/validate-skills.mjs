#!/usr/bin/env node
// Checks that every skill is wired up the same way, so a new or edited skill
// can't drift from the manifests, README, and evals.
// Exits 1 and lists every problem found.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugins", "joshghent-skills");
const read = (path) => readFileSync(path, "utf8");

const MAX_DESCRIPTION = 700;
// Keeps the part that loads on every run small. Templates and checklists go in references/.
const MAX_SKILL_LINES = 500;
// Phrases Snyk's skills.sh audit rates as the skill hiding its own activity (E004).
const BANNED = [/never (mention|reference) (claude|ai)\b/i, /do not (mention|reference) (claude|ai)\b/i];

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

function frontmatter(path) {
  const match = read(path).match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([a-z-]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.trim()]),
  );
}

const skills = readdirSync(join(plugin, "skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const commandsDir = join(plugin, "commands");
const commands = existsSync(commandsDir)
  ? readdirSync(commandsDir).filter((file) => file.endsWith(".md")).map((file) => file.slice(0, -3))
  : [];

const readme = read(join(repo, "README.md"));
const pluginDescription = JSON.parse(read(join(plugin, ".claude-plugin", "plugin.json"))).description;
const marketplaceDescription = JSON.parse(read(join(repo, ".claude-plugin", "marketplace.json"))).plugins[0].description;

for (const name of skills) {
  const dir = join(plugin, "skills", name);
  const skillPath = join(dir, "SKILL.md");
  const where = `skills/${name}/SKILL.md`;

  if (!existsSync(skillPath)) {
    fail(where, "missing");
    continue;
  }

  const meta = frontmatter(skillPath);
  if (!meta) {
    fail(where, "no frontmatter");
    continue;
  }
  if (meta.name !== name) fail(where, `name is "${meta.name}", expected "${name}"`);
  if (!meta.description) fail(where, "no description");
  else {
    if (meta.description.length > MAX_DESCRIPTION)
      fail(where, `description is ${meta.description.length} chars, limit ${MAX_DESCRIPTION}`);
    if (!/use when/i.test(meta.description)) fail(where, 'description needs a "Use when ..." clause so agents know when to pick it');
  }

  const body = read(skillPath);
  const lines = body.trimEnd().split("\n").length;
  if (lines > MAX_SKILL_LINES) fail(where, `${lines} lines, limit ${MAX_SKILL_LINES}. Move templates or checklists to references/`);
  for (const pattern of BANNED) if (pattern.test(body)) fail(where, `contains banned phrase ${pattern}`);
  for (const [, ref] of body.matchAll(/`(references\/[^`]+\.md)`/g))
    if (!existsSync(join(dir, ref))) fail(where, `points at ${ref}, which does not exist`);

  if (!readme.includes(`| \`${name}\` |`)) fail("README.md", `"What's inside" table has no row for ${name}`);
  if (!pluginDescription.includes(name)) fail("plugin.json", `description does not mention ${name}`);
  if (!marketplaceDescription.includes(name)) fail("marketplace.json", `description does not mention ${name}`);
  if (!existsSync(join(plugin, "evals", `${name}-trigger`, "prompt.md")))
    fail(where, `no trigger eval at evals/${name}-trigger/prompt.md`);
}

// A command with a skill's name hides the skill: the Skill tool loads the
// command and the agent never reads SKILL.md. Skills are slash commands already.
for (const name of commands.filter((command) => skills.includes(command)))
  fail(`commands/${name}.md`, `shares a name with skills/${name}, so the Skill tool loads it instead of SKILL.md`);

if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"));
  process.exit(1);
}
console.log(`${skills.length} skills valid`);
