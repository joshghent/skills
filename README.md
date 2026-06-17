# Product Skills

A Claude Code plugin marketplace for product engineering work. One plugin,
`product-skills`, bundling five small, focused
[skills](https://docs.claude.com/en/docs/claude-code/skills): write marketing
content from your commits, review a UI's design, audit a repo for risk, keep
dependencies patched, and turn a plan into an importable Gantt timeline. Each
ships a slash command, so you can trigger it directly or let Claude reach for it
when a request matches.

## Install

Two commands — add the marketplace, then install the plugin:

```sh
# Add marketplace
/plugin marketplace add joshghent/skills

# Install plugin
/plugin install product-skills@product-skills
```

All four skills ship in the single `product-skills` plugin. Update later with:

```sh
/plugin marketplace update product-skills
```

## What's inside

| Skill | Command | What it does |
|-------|---------|--------------|
| `blogger` | `/blogger` | Turns shipped commits into dated blog posts, changelog entries, and social snippets in your site's voice. |
| `design-review` | `/design-review` | Reviews a UI for conversion, UI/UX, accessibility, performance, and SEO against Apple/FT/OpenAI standards, and flags AI design slop. |
| `sentinel` | `/sentinel` | Audits the whole repo for quality, coverage, CI, security, and AI-agent fragility, ranked by production risk. |
| `warden` | `/warden` | Patches security alerts and bumps dependencies safely, verified by your own build and tests, in one clean PR. |
| `gantarr` | `/gantarr` | Turns a plan, roadmap, or conversation into a valid `GanttProject` JSON file you can import at [gantarr.joshghent.com](https://gantarr.joshghent.com) to render a timeline. |

## blogger

Point it at recent work and it drafts content grounded in real commits. It reads
the code, commit history, and your existing site voice before writing, dates
each post from the commit that introduced the feature, and skips refactors,
dependency bumps, and "AI wrote a thing" filler with no user-facing value.

```sh
/blogger last 20 commits
/blogger since v1.2.0
```

## design-review

A senior product-designer's critique of a UI, not a generic best-practice
lecture. Point it at a live URL, a running dev server, or a component, and it
reviews the real rendered experience: it walks the primary user flow, checks
1440 / 768 / 375px viewports, exercises interaction and keyboard states, and
measures Core Web Vitals and contrast where it can drive a browser.

It judges the work against the houses that set the bar — Apple (clarity,
hierarchy, the 8pt grid), the Financial Times (serif headline + sans data,
trust through restraint), and OpenAI/ChatGPT (whitespace as the bold move, one
dominant control) — weighs conversion heavily (value prop, single primary CTA,
form friction, trust signals), and calls out AI design slop by name: the indigo
gradient, the generic hero plus three feature cards, emoji headings, no real
type scale. Findings come back ranked by impact, ending with the single
highest-leverage change.

```sh
/design-review http://localhost:3000
/design-review the pricing page
/design-review src/components/Hero.tsx
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

## gantarr

A plan turned into a timeline you can actually show off. Point it at a roadmap,
a phased delivery plan, or just the work discussed in the conversation, and it
emits a complete `.gantarr.json` file matching
[Gantarr's](https://gantarr.joshghent.com) `GanttProject` schema — phases become
workstreams, tasks become dated bars, work types become a colour legend, and
"X blocks Y" becomes dependency arrows.

Gantarr imports the file verbatim with no validation, so the skill is strict
about it: every reference resolves, every date parses (`YYYY-MM-DD`, inclusive),
and it runs a validation pass before handing the file over. Then you load it in
the app's toolbar and the chart renders immediately.

```sh
/gantarr the plan above, starting next Monday
/gantarr roadmap.md
```

## Manual install

If you don't want the marketplace, copy a single skill into your skills folder.
Claude Code picks it up and invokes it when a request matches its description.

```sh
# Project-level (one repo)
cp -r plugins/product-skills/skills/warden /path/to/your-repo/.claude/skills/

# User-level (everywhere)
cp -r plugins/product-skills/skills/warden ~/.claude/skills/
```

## Repo layout

```
.claude-plugin/marketplace.json          # the marketplace manifest
plugins/
  product-skills/
    .claude-plugin/plugin.json           # plugin metadata
    commands/<skill>.md                  # one /<skill> slash command per skill
    skills/<skill>/SKILL.md              # each skill's full process
```

Everything ships in the one `product-skills` plugin so install stays two
commands. To add a skill: drop `commands/<name>.md` and `skills/<name>/SKILL.md`
into `plugins/product-skills/`. Keep the command name and skill name identical
(a single word where it reads well) so the dev UX stays predictable.
