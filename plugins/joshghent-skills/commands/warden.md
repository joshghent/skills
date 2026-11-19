---
description: Patch security alerts and bump dependencies safely, then open one clean PR.
argument-hint: [optional: "security" for the initial high/critical alert PR, or "analysis only" to skip opening a PR]
---

Use the `warden` skill and follow it end to end.

Mode: $ARGUMENTS

If "security" is requested, run the skill's initial security PR mode. If "analysis only" is requested, produce the tables without opening a PR.
