---
description: Merge all ready open PRs in reverse chronological order, each verified green, then confirm CI ships the apps live.
argument-hint: [optional: repo, base branch, or "dry run" to preview without merging]
---

Use the `conductor` skill and follow it end to end.

Scope: $ARGUMENTS

If no scope is given, operate on the current repository and its default base
branch. If "dry run" (or "analysis only") is requested, produce the merge plan
and deploy readiness without merging or deploying anything.
