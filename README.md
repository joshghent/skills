# Product Skills

A Claude Code plugin marketplace for product engineering work. Three small,
focused plugins: write marketing content from your commits, audit a repo for
risk, and keep dependencies patched. Each one ships a slash command and a
[skill](https://docs.claude.com/en/docs/claude-code/skills), so you can trigger
it directly or let Claude reach for it when a request matches.

## Install

Add the marketplace once, then install the plugins you want:

```sh
/plugin marketplace add joshghent/skills
/plugin install blogger@product-skills
/plugin install sentinel@product-skills
/plugin install warden@product-skills
```

Update later with:

```sh
/plugin marketplace update product-skills
```

## What's inside

| Plugin | Command | What it does |
|--------|---------|--------------|
| `blogger` | `/blogger` | Turns shipped commits into dated blog posts, changelog entries, and social snippets in your site's voice. |
| `sentinel` | `/sentinel` | Audits the whole repo for quality, coverage, CI, security, and AI-agent fragility, ranked by production risk. |
| `warden` | `/warden` | Patches security alerts and bumps dependencies safely, verified by your own build and tests, in one clean PR. |

## blogger

Point it at recent work and it drafts content grounded in real commits. It reads
the code, commit history, and your existing site voice before writing, dates
each post from the commit that introduced the feature, and skips refactors,
dependency bumps, and "AI wrote a thing" filler with no user-facing value.

```sh
/blogger last 20 commits
/blogger since v1.2.0
```

## sentinel

A senior-engineer audit rather than a line-by-line style review. It looks for
the code most likely to break, rot, or quietly ship defects: missing tests on
critical paths, weak CI, duplicated concepts, dead code, silent fallbacks, and
patterns that make a repo hard for the next agent to work in safely.

It runs the project's own build, test, typecheck, and lint commands where it
can, then ranks findings by production and maintenance risk into a fix plan.

```sh
/sentinel
/sentinel src/billing
```

## warden

The dependency maintenance people put off, handed back as one reviewable PR. It
detects the package manager from the lockfile, fixes known vulnerabilities
before routine bumps, prefers lockfile-only overrides for transitive issues,
isolates breaking major bumps, and verifies every change with the project's own
build and tests before opening a PR. It records what it skipped and why.

```sh
/warden
/warden analysis only
```

## Manual install

If you don't want the marketplace, copy a single skill into your skills folder.
Claude Code picks it up and invokes it when a request matches its description.

```sh
# Project-level (one repo)
cp -r plugins/warden/skills/warden /path/to/your-repo/.claude/skills/

# User-level (everywhere)
cp -r plugins/warden/skills/warden ~/.claude/skills/
```

## Repo layout

```
.claude-plugin/marketplace.json   # the marketplace manifest
plugins/
  <plugin>/
    .claude-plugin/plugin.json     # plugin metadata
    commands/<plugin>.md           # the /<plugin> slash command
    skills/<plugin>/SKILL.md       # the skill's full process
```

To add a plugin: create `plugins/<name>/` with those three files and add an
entry to `plugins[]` in `marketplace.json`. Keep the plugin name, command name,
and skill name the same single word so the dev UX stays predictable.
