---
description: Review a site's search (SEO) and AI-answer (GEO) visibility using GSC, Ahrefs, and PostHog, then optimise it.
argument-hint: [domain, URL, or page/section to focus on]
---

Use the `beacon` skill to review and optimise search and AI-answer visibility.

Target: $ARGUMENTS

If a domain or URL is given, review that property. If a specific page or section
is given, focus the review there but still use site-wide data for context. If
nothing is given, establish the site from the repo/config or ask which property
to review.

Follow the skill end to end: confirm the property and which data sources are
connected (Google Search Console via Ahrefs, Ahrefs Site Explorer / Site Audit /
Brand Radar, PostHog analytics), pull the real data before judging, then review
both **SEO** (technical health, indexation, rankings, content, links) and
**GEO** (visibility and citation inside AI answers — ChatGPT, Perplexity, Google
AI Overviews). Ground every finding in the pulled data, rank by traffic/revenue
impact, and return the skill's output format ending with the single
highest-leverage change. If the user asks you to optimise directly, apply the
changes to the codebase following the skill's editing rules; otherwise return a
prioritised plan.
