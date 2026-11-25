// Ranks skills against a prompt by the words they share. A word-level stand-in
// for how an agent picks a skill from its description: it can't judge meaning,
// but it catches descriptions missing the words users say.

// ponytail: suffix stripping, not a real stemmer. Swap in Porter if word forms start missing.
const singular = (word) => (word.length <= 3 ? word : word.replace(/ies$/, "y").replace(/s$/, ""));
const stem = (word) => {
  const base = singular(word);
  return base.length <= 4 ? base : base.replace(/(ing|ed|e)$/, "");
};

const words = (text) => (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stem);

// A word in every description says nothing about which skill to pick, so it weighs 0.
function inverseFrequency(skills) {
  const counts = new Map();
  for (const skill of skills) for (const word of new Set(words(skill.description))) counts.set(word, (counts.get(word) ?? 0) + 1);
  return (word) => (counts.has(word) ? Math.log(skills.length / counts.get(word)) : 0);
}

function weights(text, idf) {
  const vector = new Map();
  for (const word of words(text)) vector.set(word, (vector.get(word) ?? 0) + idf(word));
  return vector;
}

function cosine(a, b) {
  let dot = 0;
  for (const [word, weight] of a) dot += weight * (b.get(word) ?? 0);
  const length = (vector) => Math.sqrt([...vector.values()].reduce((sum, weight) => sum + weight * weight, 0));
  return dot === 0 ? 0 : dot / (length(a) * length(b));
}

export function rankSkills(prompt, skills) {
  const idf = inverseFrequency(skills);
  const promptVector = weights(prompt, idf);
  const score = new Map(skills.map((skill) => [skill.name, cosine(promptVector, weights(skill.description, idf))]));
  return skills
    .filter((skill) => score.get(skill.name) > 0)
    .sort((a, b) => score.get(b.name) - score.get(a.name))
    .map((skill) => skill.name);
}

export function descriptionOverlap(nameA, nameB, skills) {
  const idf = inverseFrequency(skills);
  const description = (name) => skills.find((skill) => skill.name === name).description;
  return cosine(weights(description(nameA), idf), weights(description(nameB), idf));
}
