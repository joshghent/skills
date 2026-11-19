import { test } from "node:test";
import assert from "node:assert/strict";
import { descriptionOverlap, rankSkills } from "./routing.mjs";

const skills = [
  { name: "warden", description: "Patch security alerts and bump outdated dependencies in one PR." },
  { name: "blogger", description: "Write blog posts and changelog entries from recent commits." },
  { name: "gantarr", description: "Turn a project plan into an importable Gantt timeline." },
];

test("a prompt ranks the skill whose description shares its words first", () => {
  assert.equal(rankSkills("write a blog post about our commits", skills)[0], "blogger");
});

test("different forms of a word still match", () => {
  const wardenLast = [...skills].reverse();
  assert.equal(rankSkills("keep bumping each dependency", wardenLast)[0], "warden");
});

test("a word only one skill uses beats words most skills share", () => {
  const catalog = [
    { name: "reviewer", description: "review the code for the team" },
    { name: "deployer", description: "deploy the code for the team" },
    { name: "planner", description: "plan the roadmap" },
  ];
  assert.equal(rankSkills("the code for the roadmap", catalog)[0], "planner");
});

test("overlap is 1 for identical descriptions and 0 for descriptions with no words in common", () => {
  const catalog = [
    { name: "first", description: "merge ready pull requests" },
    { name: "copy", description: "merge ready pull requests" },
    { name: "other", description: "draw a gantt timeline" },
  ];
  assert.equal(descriptionOverlap("first", "copy", catalog).toFixed(6), "1.000000");
  assert.equal(descriptionOverlap("first", "other", catalog), 0);
});

test("a plural of an -ing word matches its singular", () => {
  const catalog = [
    { name: "seo", description: "improve rankings" },
    { name: "plan", description: "draw a timeline" },
    { name: "merge", description: "merge pull requests" },
  ];
  assert.equal(rankSkills("why is our ranking low", [...catalog].reverse())[0], "seo");
});
