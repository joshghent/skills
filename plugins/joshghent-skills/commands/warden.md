---
description: Patch security alerts and bump dependencies safely, then open one clean PR.
argument-hint: [optional: "security" for the initial high/critical alert PR, or "analysis only" to skip opening a PR]
---

Use the `warden` skill to do a dependency and security sweep on this repo.

Mode: $ARGUMENTS

Follow the skill end to end: set up isolation first, detect the package manager
from the lockfile, pull recent production error signals (Sentry, New Relic,
Cloudflare Workers, Vercel, Supabase, etc.) read-only to prioritise by real
impact, fix known vulnerabilities before routine bumps, verify every change with
the project's own build and tests, and isolate breaking major bumps. Open one
clean, well-summarised PR with the production-errors, security, updates, and
skipped tables. If "analysis only" is requested, produce the same tables and
commands without opening a PR.

If "security" is requested, run the skill's initial security PR mode: ask whether
to cover the current repo, a list of repos, or an org (showing per-repo alert
counts for an org), collect every open high and critical alert from Dependabot,
code scanning and secret scanning, then open one short PR labelled
`security-sweep` that fixes or triages them. Escalate secrets, add a test per
code fix only when no existing test covers it, and never dismiss alerts without
approval.
