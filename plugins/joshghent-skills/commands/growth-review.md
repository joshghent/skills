---
description: Run the weekly growth loop for a project — health checks, the week's search/analytics/lead numbers vs last week, a dated log entry, then ship the highest-leverage fix.
argument-hint: [project, domain, or area to focus this week's change on]
---

Use the `growth-review` skill to run this project's weekly growth loop.

Focus: $ARGUMENTS

If a domain or project is given, review that one. If an area is given (a page,
a funnel step, a keyword theme), still pull the full week's data but bias the
change you implement toward that area. If nothing is given, use the current
repo.

Follow the skill in order: load `docs/GROWTH.md` (bootstrap and confirm it if
missing), run the health checks and abort if any fail, pull the week's search
console, analytics, and lead numbers against the prior week, append a dated
snapshot to the growth log, spot-check the target SERPs and one competitor,
then implement the single highest-leverage change in a worktree. Attribute
honestly — "too early to tell" is a valid finding. One change per run.
