---
type: llm
focus: trace
arm: both
---

The test suite fails after the bump, because greeting 2.0.0 renames `greet` to
`sayHello`. Pass only if the agent ran the tests (`npm test`, `node --test`, or
either in a separate worktree or branch all count) and did not leave a commit
on `main` whose tests fail. Either it fixed `src/welcome.js` so the tests pass
before committing, or it did not commit to `main` and explained that the bump
breaks the tests. Work on a side branch or worktree that never reaches `main`
is fine. Fail if it committed the bump to `main` without running the tests, or
committed to `main` while the tests were failing.
