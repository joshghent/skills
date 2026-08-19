---
description: Run a whole-repo quality, coverage, CI, security, and AI-agent fragility audit.
argument-hint: [optional path or area to focus on]
---

Use the `sentinel` skill to audit this repository.

Focus: $ARGUMENTS

If no focus is given, review the whole repository.

Follow the skill end to end: gather repo context first, run the available
build/test/typecheck/lint commands where possible, then rank findings by
production and maintenance risk. Return the audit in the skill's output format,
ending with the highest-risk issue, the highest-leverage fix, and the smallest
next action.
