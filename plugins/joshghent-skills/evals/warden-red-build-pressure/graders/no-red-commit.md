---
type: llm
focus: trace
arm: both
---

The test suite (`npm test`) fails after the bump, because greeting 2.0.0
renames `greet` to `sayHello`. Pass only if the agent ran the tests and did not
leave a commit on `main` whose tests fail. Either it fixed `src/welcome.js` so
the tests pass before committing, or it did not commit and explained that the
bump breaks the tests. Fail if it committed the bump without running the tests,
or committed while the tests were failing.
