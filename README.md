# Product Skills

A Claude Code plugin marketplace for product engineering work. One plugin,
`joshghent-skills`, bundling eight small, focused
[skills](https://docs.claude.com/en/docs/claude-code/skills): write marketing
content from your commits, review a UI's design, audit a repo for risk, keep
dependencies patched (driven by real production errors), review a site's search
and AI-answer visibility, merge the PR queue and ship it live, run a weekly
growth loop that ships one improvement, and turn a plan into an importable
Gantt timeline. Each ships a slash command, so you can trigger
it directly or let Claude reach for it when a request matches.

## Install

Two commands, run inside Claude Code. First add the marketplace (by GitHub
repo), then install the plugin from it:

```sh
# 1. Add the marketplace — this is where you use the repo slug
/plugin marketplace add joshghent/skills

# 2. Install the plugin from that marketplace
/plugin install joshghent-skills@joshghent-skills
```

Then `/reload-plugins` (or restart Claude Code) to activate it.

**Read the install line as `plugin@marketplace`.** The part after `@` is the
**marketplace name** — which this repo names `joshghent-skills` — *not* the
GitHub repo. So it's `joshghent-skills@joshghent-skills`, not
`joshghent-skills@joshghent/skills`. The repo slug (`joshghent/skills`) is only
used in step 1, when adding the marketplace.

On recent Claude Code you can collapse both steps into one, which adds the
marketplace and installs in a single command:

```sh
/plugin install joshghent-skills@joshghent/skills
```

If that errors with `Marketplace "joshghent/skills" not found`, your version
doesn't support the shorthand — use the two-step form above.

Every skill ships in the single `joshghent-skills` plugin, so install stays at
most two commands. Update later with:

```sh
/plugin marketplace update joshghent-skills
```

## What's inside

| Skill | Command | What it does |
|-------|---------|--------------|
| `blogger` | `/blogger` | Turns shipped commits into dated blog posts, changelog entries, and social snippets in your site's voice. |
| `design-review` | `/design-review` | Reviews a UI for conversion, UI/UX, accessibility, performance, and SEO against Apple/FT/OpenAI standards, and flags AI design slop. |
| `sentinel` | `/sentinel` | Audits the whole repo for quality, coverage, CI, security, and AI-agent fragility, ranked by production risk. |
| `warden` | `/warden` | Pulls production errors (Sentry, New Relic, Cloudflare Workers…), then patches security alerts and bumps dependencies safely, verified by your own build and tests, in one clean PR. |
| `beacon` | `/beacon` | Reviews a site's SEO and GEO (AI-answer) visibility from GSC, Ahrefs, and PostHog data, then optimises pages, metadata, and structured data. |
| `conductor` | `/conductor` | Merges all ready open PRs in reverse chronological order, each verified green, then confirms CI ships the apps live. |
| `growth-review` | `/growth-review` | Runs a project's weekly growth loop: health checks, the week's numbers vs last week, a dated log entry, then implements the single highest-leverage change. |
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
first pulls recent production errors and logs (Sentry, New Relic, Cloudflare
Workers, Vercel, Supabase, Datadog — read-only) so real impact drives priority,
then detects the package manager from the lockfile, fixes known vulnerabilities
before routine bumps, prefers lockfile-only overrides for transitive issues,
isolates breaking major bumps, and verifies every change with the project's own
build and tests before opening a PR. The PR ships with a production-errors
baseline, and it records what it skipped and why.

```sh
/warden
/warden analysis only
```

## beacon

Search and AI-answer visibility, driven by your real data instead of generic
best-practice lectures. It pulls Google Search Console (via Ahrefs), Ahrefs Site
Explorer / Site Audit / Keywords Explorer, Ahrefs Brand Radar (AI-answer
citations and share of voice), and PostHog behaviour, then reviews two
disciplines at once:

- **SEO** — technical health and indexation, striking-distance keywords (page-2
  rankings a nudge from page 1), high-impression / low-CTR titles, content gaps
  vs competitors, decaying pages, internal linking, and backlinks to reclaim.
- **GEO** (Generative Engine Optimization) — whether ChatGPT, Perplexity, and
  Google AI Overviews can find, trust, and *cite* your pages: answer-first
  structure, question-shaped headings, extractable facts, entity clarity,
  schema.org, and whether AI crawlers (`GPTBot`, `PerplexityBot`, `ClaudeBot`,
  `Google-Extended`) are even allowed in `robots.txt`.

Findings come back ranked by traffic and revenue impact, each tied to the query,
page, or metric behind it. Ask it to optimise and it applies the fixes —
metadata through the framework's real mechanism, structured data that matches
the page, answer-first content edits in your voice — never anything that risks a
penalty.

```sh
/beacon example.com
/beacon the /pricing page
/beacon
```

## conductor

The release manager for a PR backlog. It enumerates the open pull requests,
keeps only the ones that are genuinely ready (not draft, mergeable, required
checks green, approvals satisfied, no `do-not-merge` signal), and merges them in
reverse chronological order — one at a time, updating each branch against the
base and waiting for CI green before merging, then re-checking the rest after
every merge so the train self-heals as `main` moves. Anything that conflicts or
fails is skipped and recorded, never forced; it never uses `--admin` or bypasses
branch protection.

Then it makes sure the code actually shipped: it finds the deploy pipeline
(GitHub Actions, Cloudflare Workers/Pages, Vercel…), watches the post-merge
deploy run, and smoke-checks the live app (200 + version match). If there's no
deploy step or it didn't trigger, it flags the gap and offers to trigger or wire
up the deploy. It confirms the plan before the first merge, since merging and
deploying are hard to reverse.

```sh
/conductor
/conductor dry run
```

## growth-review

The weekly loop for a project that needs to grow. It reads `docs/GROWTH.md` for
the domain, search property, analytics source, and KPIs (and bootstraps that
file the first time), then health-checks the site before trusting a single
number — homepage serving real content, analytics events inside 48 hours,
domain not about to expire. Clean week-over-week charts on a dead site are the
failure mode it exists to catch.

Then it pulls the week: clicks, impressions, CTR and position from search
console, sessions and conversions from analytics, new leads and their sources,
AI-assistant crawler hits if you log them. It appends a dated snapshot to the
growth log, never overwriting history, and attributes honestly — "too early to
tell" is a valid finding.

It finishes by building something. One change per run, chosen by the data in
priority order: anything broken, then striking-distance pages sitting at
position 8–20, then CTR fixes where the ranking is fine and the title isn't
earning the click, then the content backlog.

```sh
/growth-review
/growth-review the pricing page
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
cp -r plugins/joshghent-skills/skills/warden /path/to/your-repo/.claude/skills/

# User-level (everywhere)
cp -r plugins/joshghent-skills/skills/warden ~/.claude/skills/
```

## Repo layout

```
.claude-plugin/marketplace.json          # the marketplace manifest
plugins/
  joshghent-skills/
    .claude-plugin/plugin.json           # plugin metadata
    commands/<skill>.md                  # one /<skill> slash command per skill
    skills/<skill>/SKILL.md              # each skill's full process
```

Everything ships in the one `joshghent-skills` plugin so install stays short (one
or two commands). To add a skill: drop `commands/<name>.md` and `skills/<name>/SKILL.md`
into `plugins/joshghent-skills/`. Keep the command name and skill name identical
(a single word where it reads well) so the dev UX stays predictable.
