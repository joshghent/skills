# Product Skills

Reusable [Claude skills](https://docs.claude.com/en/docs/claude-code/skills) for product work. Each skill is a portable prompt/process that can be copied into a product repo, agent setup, or automation workflow.

## Installation

Each skill lives in its own directory containing a `SKILL.md`. To install, copy the skill directory into your Claude skills folder:

```bash
# Project-level (available in one repo)
cp -r feature-blogger /path/to/your-repo/.claude/skills/

# User-level (available everywhere)
cp -r feature-blogger ~/.claude/skills/
```

Claude Code picks the skill up automatically and invokes it when a request matches its description.

## Skills

### `feature-blogger`

Turns real shipped engineering work into product content. Analyses recent commits, identifies genuinely user-facing features, and drafts dated markdown blog posts, changelog entries, SEO pages, launch notes, and social snippets — all in the same voice as the existing site.

It inspects real code, commit history, and site voice before writing, and skips refactors, dependency bumps, and "AI wrote a feature" filler that has no user-facing value.

### `repo-sentinel`

Whole-repository quality, coverage, CI, security, and AI-agent fragility review — a senior-engineer audit rather than a line-by-line style review. Useful for pre-launch hardening, checking whether an AI-built repo is safe to keep extending, finding test/coverage gaps, and spotting duplicated concepts, dead code, and silent fallbacks.

It is evidence-based: it runs the available build/test/typecheck/lint commands where possible, then ranks findings by production and maintenance risk into a remediation plan.
