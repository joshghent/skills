---
description: Merge all ready open PRs in reverse chronological order, each verified green, then confirm CI ships the apps live.
argument-hint: [optional: repo, base branch, or "dry run" to preview without merging]
---

Use the `conductor` skill to merge the open PRs and ship them to production.

Scope: $ARGUMENTS

If no scope is given, operate on the current repository and its default base
branch. If "dry run" (or "analysis only") is requested, produce the merge plan
and deploy readiness without merging or deploying anything.

Follow the skill end to end: enumerate open PRs, filter to the ones that are
genuinely ready (not draft, mergeable, required checks green, approvals
satisfied, no do-not-merge signal), order them **reverse chronological (newest
first)**, then merge one at a time — updating each PR against the base and
waiting for CI green before merging, updating and re-checking the rest after
each merge, and skipping (never forcing) anything that conflicts or fails.
**Confirm the full plan with the user before the first merge** — this is
outward-facing and hard to reverse. After merging, verify the CD pipeline
actually deploys and the apps are **live** (deploy succeeded + smoke check), and
if there's no deploy step or it's broken, flag it and offer to wire it up.
Return the skill's output format: merged, skipped (with reasons), and live
deploy status.
