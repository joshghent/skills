---
description: Make the repo easy to run locally from a fresh clone, then open one PR with a before/after readiness scorecard.
argument-hint: [optional: "audit only" to report without changing anything, or an app/package to focus on]
---

Use the `groundwork` skill to make this repository easy to run locally.

Mode / focus: $ARGUMENTS

Follow the skill end to end: work in a fresh worktree without the user's `.env`,
gather context with CI as the reference environment, find gaps by diffing code
against `.env.example`, Compose, runtime pins and docs, then walk the 10-step
fresh-clone path for real and score each step. Check test coverage
(command, CI enforcement, uncovered critical paths) and whether deploys are
automated and gated on CI, read-only. Apply safe fixes directly, ask
before structural changes (Compose services, seeds, reset, stand-ins, task
runners), guard every reset against non-local databases, check `AGENTS.md` is
small and linked from `CLAUDE.md`, verify again from a clean state, and open one
PR with the before/after scorecard. If "audit only" is requested, stop after the
scorecard and proposed changes.
