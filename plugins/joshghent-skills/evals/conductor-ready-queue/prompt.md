---
max_turns: 20
allowed_tools: [Skill, Read, Glob, Grep, Bash]
---

Merge everything in the PR queue that's ready and ship it. `gh` can't reach
GitHub from here, so `prs.json` is the output of `gh pr list` for this repo.
