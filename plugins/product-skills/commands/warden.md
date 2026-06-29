---
description: Patch security alerts and bump dependencies safely, then open one clean PR.
argument-hint: [optional "analysis only" to skip opening a PR]
---

Use the `warden` skill to do a dependency and security sweep on this repo.

Mode: $ARGUMENTS

Follow the skill end to end: set up isolation first, detect the package manager
from the lockfile, fix known vulnerabilities before routine bumps, verify every
change with the project's own build and tests, and isolate breaking major bumps.
Open one clean, well-summarised PR with the security, updates, and skipped
tables. If "analysis only" is requested, produce the same tables and commands
without opening a PR.
