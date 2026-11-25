#!/usr/bin/env node
// Checks that each prompt in evals/routing.json ranks the expected skill first
// against the real descriptions, and that no two descriptions overlap too much.
// Free and deterministic, so it runs in CI. The paid trigger evals judge meaning.
// A failure usually means a description is missing the words users say.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { descriptionOverlap, rankSkills } from "./lib/routing.mjs";

// Just above the closest pair when this was added. Raise it only on purpose.
const MAX_OVERLAP = 0.2;

const plugin = join(dirname(fileURLToPath(import.meta.url)), "..", "plugins", "joshghent-skills");
const skills = readdirSync(join(plugin, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map(({ name }) => {
  const skill = readFileSync(join(plugin, "skills", name, "SKILL.md"), "utf8");
  return { name, description: skill.match(/^description:\s*(.*)$/m)[1] };
});
const cases = JSON.parse(readFileSync(join(plugin, "evals", "routing.json"), "utf8"));

const problems = [];
let checked = 0;
for (const [skill, { picks, nearMisses }] of Object.entries(cases)) {
  const prompts = [...picks.map((prompt) => ({ prompt, expect: skill })), ...nearMisses];
  for (const { prompt, expect } of prompts) {
    checked++;
    const ranked = rankSkills(prompt, skills);
    if (ranked[0] !== expect) problems.push(`"${prompt}" ranked ${ranked[0] ?? "no skill"} first, expected ${expect} (${ranked.includes(expect) ? `at #${ranked.indexOf(expect) + 1}` : "no shared words"})`);
  }
}

let closest = { score: 0 };
for (const [i, a] of skills.entries()) {
  for (const b of skills.slice(i + 1)) {
    const score = descriptionOverlap(a.name, b.name, skills);
    if (score > closest.score) closest = { score, pair: `${a.name} / ${b.name}` };
    if (score > MAX_OVERLAP) problems.push(`${a.name} and ${b.name} descriptions overlap ${score.toFixed(2)}, limit ${MAX_OVERLAP}`);
  }
}

const missing = skills.filter((skill) => !cases[skill.name]).map((skill) => skill.name);
for (const name of missing) problems.push(`${name} has no routing cases in evals/routing.json`);

console.log(`closest descriptions: ${closest.pair} at ${closest.score.toFixed(2)}`);
if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"));
  process.exit(1);
}
console.log(`${checked} routing prompts rank the right skill first`);
