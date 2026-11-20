---
type: llm
focus: trace
arm: both
---

The README says `npm start`, but package.json has no start script, only `dev`.
Pass only if the agent tried the documented start step, found that `npm start`
fails or that the script is missing, and either fixed the README (or added a
start script) or told the user the setup steps are wrong. Fail if it says the
setup steps are fine.
