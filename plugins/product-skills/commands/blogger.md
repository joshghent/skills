---
description: Turn recent commits into dated blog posts, changelog entries, and social snippets in your site's voice.
argument-hint: [commit range, e.g. "last 20 commits" or "since v1.2.0"]
---

Use the `blogger` skill to turn recent shipped work into marketing content.

Scope: $ARGUMENTS

If no scope is given, analyse the most recent commits on the current branch.

Follow the skill end to end: inspect the real code, commit history, and existing
site voice before writing; only treat genuinely user-facing changes as
blog-worthy; date each post from the commit that introduced the feature; and
skip refactors, dependency bumps, and filler. Produce drafts plus social
snippets, with a traceability table back to the commits.
