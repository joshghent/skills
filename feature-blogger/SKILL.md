---
name: feature-blogger
description: Analyse recent commits, identify user-facing product features, and create dated markdown blog posts in the same voice as the existing site.
---

# Feature Blogger

Use this skill when the user wants to turn recent product work into markdown blog posts, changelog-style content, SEO pages, launch notes, or social-ready feature announcements.

The goal is to convert real shipped work into useful marketing content without inventing capabilities, exaggerating impact, or creating generic AI-written fluff.

## Core Objective

Analyse recent commits, identify meaningful user-facing features or improvements, then draft markdown blog posts that:

- Are grounded in actual code changes
- Are dated according to the relevant commit date
- Match the voice, structure, and formatting of existing site posts
- Help SEO by targeting concrete feature/problem/use-case keywords
- Provide reusable snippets for socials
- Avoid claiming anything the code does not support

This skill should produce practical marketing material from engineering activity.

## What Counts As A Feature

Treat a change as blog-worthy only when it creates or materially improves something users, buyers, admins, developers, or operators can experience.

Blog-worthy examples:

- New user-facing workflows
- New product capabilities
- Integrations
- Reports, dashboards, exports, analytics, or notifications
- Security, reliability, or compliance improvements that customers care about
- Performance improvements with evidence
- New automation behaviour
- Admin tools
- Billing, plan, onboarding, or team-management improvements
- Significant UX improvements
- API changes that developers can use
- Quality-of-life improvements that remove friction

Usually not blog-worthy by themselves:

- Minor refactors
- Dependency bumps
- Formatting changes
- Internal-only cleanup
- Renames with no user value
- Test-only changes
- CI-only changes
- Comments/docs-only changes, unless docs are the product
- Experiments, dead code, or unfinished work
- Bug fixes that are too narrow or too risky to publicise

When uncertain, classify the change as either:

- `blog-worthy`
- `changelog-only`
- `skip`
- `needs-human-check`

## Safety Rules

Never invent:

- Features not shown by code, tests, docs, screenshots, or commit messages
- Performance numbers without measurement
- Security guarantees without evidence
- Customer quotes
- Integrations not actually implemented
- Pricing, plan availability, or release dates not present in the repo
- Compliance claims such as GDPR, SOC 2, HIPAA, ISO, PCI, unless explicitly documented
- Public launch status if the code looks unreleased or behind a flag

Use careful language where appropriate:

- "Designed to..."
- "Helps..."
- "Makes it easier to..."
- "Adds support for..."
- "Early support for..."
- "Available where enabled..."
- "For teams using..."

Avoid overclaiming:

- "Revolutionary"
- "Game-changing"
- "Perfect"
- "Guaranteed"
- "Enterprise-grade" unless the product/site already uses that positioning and the feature supports it

If the code suggests a feature but release status is unclear, mark the draft as requiring human review before publishing.

## Discovery Workflow

Start by understanding the repository and content system.

Run:

```bash
pwd
git status --short
git branch --show-current
git log --oneline --decorate -30
find . -maxdepth 4 -type f | sed 's#^\./##' | sort | head -400
```

Then identify:

- App/product name
- Target audience
- Existing blog/content directory
- Markdown frontmatter format
- Existing post voice and structure
- Date format and slug convention
- Whether posts use MD, MDX, Astro, Next.js, Nuxt, Eleventy, Hugo, Jekyll, or another system
- Whether images are expected
- Whether draft status is supported
- Whether tags/categories/authors are required
- Whether posts need excerpts, meta descriptions, canonical URLs, OG fields, or social images

Inspect likely locations:

```bash
find . -maxdepth 4 \( -iname "*blog*" -o -iname "*posts*" -o -iname "*content*" -o -iname "*articles*" -o -iname "*changelog*" \) -print
find . -maxdepth 5 \( -name "*.md" -o -name "*.mdx" \) | head -100
```

Inspect existing posts before writing anything.

## Commit Analysis

Unless the user specifies a range, analyse recent commits from the current branch.

Suggested defaults:

```bash
git log --date=short --pretty=format:'%h%x09%ad%x09%an%x09%s' -30
```

If a previous release tag exists, also inspect commits since that tag:

```bash
git describe --tags --abbrev=0 2>/dev/null || true
git log --date=short --pretty=format:'%h%x09%ad%x09%an%x09%s' $(git describe --tags --abbrev=0 2>/dev/null)..HEAD 2>/dev/null || true
```

For likely feature commits, inspect details:

```bash
git show --stat --summary <commit>
git show --name-only --format=fuller <commit>
git show --unified=80 <commit> -- <relevant paths>
```

Use commit messages as clues, not truth. Verify against code, tests, docs, schema changes, routes, UI copy, API handlers, migrations, and config.

## Feature Grouping

Group commits into coherent feature stories.

A blog post should usually map to one of:

1. A single meaningful feature commit
2. A small set of related commits forming one feature
3. A feature plus its follow-up polish/fixes
4. A release roundup, when many small user-facing improvements landed close together

Do not create one blog post per commit by default. That creates noise and weak SEO.

For each candidate feature, capture:

- Commit hash or range
- Commit date or date range
- User-facing capability
- Who benefits
- Problem it solves
- Evidence from files changed
- Release confidence
- Suggested content type
- SEO keyword angle
- Social angle
- Publish recommendation

## Dating Rules

Posts should be dated based on the commit that introduced the feature.

Use:

1. The feature-introducing commit date, if clear
2. The latest commit date in the grouped feature, if the feature needed follow-up fixes
3. The merge commit date, if working from merge commits
4. Today only if the user explicitly asks for a new announcement rather than historical posts

If a post groups multiple features, use the latest commit date in the group.

Preserve the site’s date format exactly.

Examples:

```yaml
date: "2026-05-21"
publishedAt: 2026-05-21
pubDate: 2026-05-21
created: "2026-05-21T00:00:00.000Z"
```

If the site uses filenames with dates, match the convention:

```text
2026-05-21-feature-name.md
2026-05-21-feature-name.mdx
feature-name.md with date in frontmatter
```

## Voice Matching

Before drafting, inspect at least 3 existing posts where available.

Create a voice profile:

- Formal vs conversational
- First-person vs company voice
- Technical depth
- Sentence length
- Headline style
- Use of humour
- Use of bullets
- CTA style
- How direct the copy is
- How much product positioning appears
- Whether posts are tutorial-like, announcement-like, or narrative
- Common phrases or avoided phrases
- UK vs US spelling
- Markdown/MDX component usage

Then write in that voice.

If no posts exist, infer voice from:

- Homepage copy
- Docs
- README
- Product landing pages
- Existing changelog
- App UI copy

If there is still no reliable voice source, use a clear, practical, developer-friendly tone.

## SEO Rules

Each post should have a specific search intent.

Prefer concrete, long-tail angles:

- "automated code review for pull requests"
- "GitHub repo monitoring for AI generated code"
- "team onboarding checklist software"
- "AI coding agent guardrails"
- "developer workflow automation"

Avoid vague angles:

- "new feature"
- "better productivity"
- "AI tool update"
- "platform improvements"

For every post, include where the content system supports it:

- SEO title
- Meta description
- Slug
- Excerpt
- Tags/categories
- Internal links to relevant docs/product pages
- A CTA aligned with the site’s existing style

Do not keyword-stuff. The post must read naturally.

## Social Snippets

For each generated post, also create short promotional snippets in a companion section or separate file, depending on the site convention.

Include:

- One LinkedIn-style post
- One X/Twitter-style post
- One short founder/dev build-in-public post
- Optional launch/changelog one-liner

Keep social copy grounded in the feature and avoid inflated claims.

If the site does not have a place for social snippets, include them in the final response rather than inside the published markdown file.

## Post Types

Choose the best format based on the feature.

### Feature Announcement

Use when a clear product capability shipped.

Suggested structure:

```markdown
# Feature headline

Short intro explaining the user problem.

## What changed

## Why it matters

## How it works

## Who this helps

## Try it / Get started
```

### Problem/Solution SEO Post

Use when the feature solves a searchable pain.

Suggested structure:

```markdown
# Problem-focused title

Intro grounded in the pain.

## The problem

## The old way

## The new way

## How [Product] helps

## What to try next
```

### Technical Deep Dive

Use when the target audience is technical and the change has implementation interest.

Suggested structure:

```markdown
# Technical title

## Context

## What changed

## Design trade-offs

## How to use it

## What’s next
```

### Release Roundup

Use when many small changes landed close together.

Suggested structure:

```markdown
# Product updates for [month/date]

## Highlights

## Smaller improvements

## Fixes worth knowing about

## What’s next
```

## Markdown Creation Rules

When creating posts:

1. Match existing file extension: `.md` or `.mdx`
2. Match frontmatter style exactly
3. Match slug style exactly
4. Match date format exactly
5. Match author/category/tag fields when used
6. Preserve existing import/component patterns in MDX
7. Put posts in the correct content directory
8. Do not create images unless asked
9. Do not modify unrelated files unless required by the content system
10. Do not publish as non-draft if the repo convention supports drafts and release confidence is low

If frontmatter has required unknown fields, infer from nearest existing post and flag uncertainty.

## Evidence Requirements

Every post idea must be traceable to evidence.

Acceptable evidence:

- Commit hash
- Changed files
- Route/API additions
- UI copy additions
- Tests added
- Database migrations
- Docs updates
- Feature flags
- Config additions
- Package integrations
- README/changelog notes

In the final response, include a traceability table.

## Recommended Output Modes

If the user asks to create files, create files.

If the user asks for ideas first, do not create files; produce a content plan.

If unclear, default to creating drafts only when the content directory is obvious and the feature evidence is strong.

## Commands To Use

Useful git commands:

```bash
git log --date=short --pretty=format:'%h%x09%ad%x09%s' -50
git log --name-status --date=short --pretty=format:'---%n%h%x09%ad%x09%s' -30
git show --stat <commit>
git show --name-only <commit>
git show <commit> -- <path>
git diff --stat HEAD~10..HEAD
git diff --name-only HEAD~10..HEAD
```

Useful content inspection commands:

```bash
find . -maxdepth 5 \( -name "*.md" -o -name "*.mdx" \) | sort
grep -R "title:" -n content app pages src 2>/dev/null | head -50
grep -R "description:" -n content app pages src 2>/dev/null | head -50
grep -R "date:" -n content app pages src 2>/dev/null | head -50
```

Useful package checks:

```bash
cat package.json 2>/dev/null
cat astro.config.* 2>/dev/null
cat next.config.* 2>/dev/null
cat nuxt.config.* 2>/dev/null
```

## Classification Output

Before creating files, produce or internally maintain a candidate table:

```markdown
| Candidate | Commits | Date | Evidence | Classification | Content angle | Confidence |
|---|---|---:|---|---|---|---|
| Feature name | abc123, def456 | 2026-05-21 | paths | blog-worthy | SEO angle | High |
```

Create posts only for `blog-worthy` features with medium or high confidence, unless the user explicitly requests drafts for uncertain items.

## Final Response Format

When finished, respond with:

```markdown
## Created posts

| Post | Date | Feature source | Status |
|---|---:|---|---|
| path/to/post.md | 2026-05-21 | abc123 | Draft/Published-ready |

## Skipped changes

| Change | Reason |
|---|---|
| dependency bump | not user-facing |

## Social snippets

### Post title

LinkedIn:
...

X:
...

Build-in-public:
...

## Notes / human checks

- Anything that needs confirmation before publishing.
```

If no posts are created, explain why and provide the best next step.

## Quality Bar

A good output:

- Reads like the existing site
- Is specific to the product
- Is traceable to actual commits
- Has a clear SEO angle
- Avoids exaggerated AI marketing language
- Gives the user ready-to-publish markdown or clearly marked drafts
- Turns engineering progress into useful distribution assets

A bad output:

- Creates one post per tiny commit
- Invents feature value
- Sounds like generic SaaS content
- Ignores the existing site voice
- Uses today’s date for historical work
- Publishes uncertain features without warning
- Treats refactors as user-facing launches
- Adds noisy content that will not help SEO or trust

## Example Prompt

```text
Use the feature-blogger skill.

Analyse the latest 20 commits. Identify user-facing features or meaningful product improvements. Create dated markdown blog post drafts in the same style as the existing site posts. Also give me LinkedIn, X, and build-in-public snippets for each post. Do not invent features. If a change is not blog-worthy, skip it and explain why.
```

## Optional Follow-Up: Content Calendar

If the repo has many blog-worthy changes, suggest a content calendar rather than publishing everything at once.

Group posts by:

- Launch announcement
- SEO evergreen post
- Technical deep dive
- Founder/build-in-public update
- Changelog roundup

Prefer fewer, stronger posts over many weak ones.