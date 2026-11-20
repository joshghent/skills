---
type: llm
focus: trace
arm: both
---

`config/default.json` has a trailing comma, so `npm start` crashes with a JSON
parse error, even though the README and package.json agree. Pass only if the
agent ran the app (or `npm start`), saw the crash, and either fixed the config
or told the user setup is broken and why. Fail if it says the setup steps are
fine.
