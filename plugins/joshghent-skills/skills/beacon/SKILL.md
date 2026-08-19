---
name: beacon
description: Data-driven SEO and GEO (Generative Engine Optimization) review and optimisation for a website. Pulls real data from Google Search Console (via Ahrefs), Ahrefs (Site Explorer, Site Audit, Keywords Explorer, Brand Radar), and PostHog, then reviews technical health, indexation, rankings, content, backlinks, and AI-answer visibility — and applies the fixes. Use when the user wants an SEO audit, GEO / AI-search / LLM-visibility review, to improve rankings or organic traffic, to get cited in ChatGPT/Perplexity/AI Overviews, or to optimise pages, metadata, structured data, or content for search and AI engines.
---

# Beacon: Search & AI-Answer Visibility

Use this skill when the user wants their site found — both by classic search
engines (**SEO**) and by AI answer engines (**GEO** — Generative Engine
Optimization: ChatGPT, Perplexity, Google AI Overviews, Claude, Copilot). The
job is to pull the real data, find what's costing the site visibility, traffic,
and citations, and fix it — ranked by impact.

The goal is a **more visible, better-converting site**, not a report that merely
"ran". Every finding is grounded in pulled data (a query, a page, a metric), and
the highest-leverage fixes get applied, not just listed.

## Operating principle

Act like a senior SEO/growth engineer who owns the number, not a checklist bot.
Two disciplines, one funnel:

- **SEO** — earn ranking positions and clicks from search engine results.
- **GEO** — earn mentions and citations inside AI-generated answers. Different
  mechanics, overlapping foundations. A site can rank #1 on Google and be
  invisible in ChatGPT, or vice versa.

Never invent metrics. If a data source isn't connected, say so and work with
what you have — don't guess at traffic or rankings. Tie every recommendation to
a consequence: a query stuck on page 2, a high-impression / low-CTR title, a
page AI engines can't cite because it has no extractable answer. Vague advice
("write more content", "build backlinks") is banned — be specific to *this*
site's data.

Don't rewrite working content in your own voice. Default to a ranked, evidenced
plan; apply changes when asked, preserving the site's voice and structure.

## Data sources & how to use them

Confirm which of these are connected before you start; use whichever the user
has and name what's missing. **Pull data first — judge second.**

### Google Search Console (via the Ahrefs MCP `gsc-*` tools)

The ground truth for how the site actually performs in Google. Key tools:

- `gsc-keywords` / `gsc-keyword-history` — queries the site ranks for, with
  clicks, impressions, CTR, average position.
- `gsc-pages` / `gsc-page-history` / `gsc-pages-history` — performance per page.
- `gsc-performance-by-position` / `gsc-ctr-by-position` — where clicks come from
  and how CTR decays by position (find title/meta underperformers).
- `gsc-performance-by-device` / `gsc-metrics-by-country` — device and geo splits.
- `gsc-positions-history` / `gsc-performance-history` — trend over time (is the
  site growing, flat, or sliding?).
- `gsc-anonymous-queries` — the long tail GSC anonymises.

### Ahrefs — Site Explorer, Site Audit, Keywords Explorer

- **Technical health:** `site-audit-projects` → `site-audit-issues` (crawl
  errors, broken links, redirects, indexability, Core Web Vitals),
  `site-audit-page-explorer` / `site-audit-page-content` for specific pages.
- **Rankings & pages:** `site-explorer-organic-keywords`,
  `site-explorer-top-pages`, `site-explorer-pages-by-traffic`,
  `site-explorer-organic-competitors`.
- **Keyword research:** `keywords-explorer-overview`,
  `keywords-explorer-matching-terms`, `keywords-explorer-related-terms`,
  `keywords-explorer-search-suggestions`, `serp-overview` (who ranks now and
  what it takes to beat them).
- **Authority & links:** `site-explorer-domain-rating`,
  `site-explorer-backlinks-stats`, `site-explorer-referring-domains`,
  `site-explorer-broken-backlinks` (reclaim lost links),
  `site-explorer-anchors`.

### Ahrefs Brand Radar — the GEO / AI-visibility data (use this for GEO)

This is how you measure AI-answer visibility, not guesswork:

- `brand-radar-ai-responses` / `brand-radar-ai-responses-entities` — where and
  how the brand shows up in AI answers.
- `brand-radar-cited-pages` / `brand-radar-cited-domains` — which pages/domains
  AI engines actually cite for the topic (your citation footprint vs
  competitors').
- `brand-radar-sov-overview` / `brand-radar-sov-history` — share of voice in AI
  answers over time.
- `brand-radar-mentions-overview` / `brand-radar-impressions-overview` — mention
  and impression volume.
- `site-explorer-ai-responses-count` — how often a URL surfaces in AI responses.

### PostHog — real user behaviour (prioritise by what converts)

SEO/GEO brings people; PostHog tells you what they do. Use the PostHog tools
(web-analytics domain, `insight`, `query`/`execute-sql` for custom questions):

- Web analytics: top entry pages, sources/channels (isolate organic + AI-referral
  traffic — `chatgpt.com`, `perplexity.ai`, `gemini.google.com` referrers),
  bounce rate, and pages by engagement.
- Funnels/conversion: which landing pages actually convert, so optimisation
  effort goes where traffic turns into signups/revenue — not just where
  impressions are highest.

### Ahrefs MCP operating notes

- Call the `doc` tool for an Ahrefs endpoint before using it the first time to
  get its exact params.
- Monetary values come back in **USD cents** — divide by 100 to show dollars.
- When a tool response includes `render_with` in its metadata, you **must** call
  the named render tool (`render-data-table`, `render-time-series-chart`,
  `render-scorecard`) with the returned data rather than dumping raw JSON.
- Respect the account's subscription limits (`subscription-info-limits-and-usage`);
  don't burn the quota on redundant pulls.

If the direct APIs aren't connected, fall back to what you can measure: crawl
the site with a browser (via the `chrome-devtools` / browser MCP), read
`robots.txt`, `sitemap.xml`, `llms.txt`, page `<head>`, and structured data
directly, and say which ranking/traffic data you couldn't verify.

## Inputs to establish first

Before pulling anything, know what you're optimising and for whom:

- **Which property?** Domain and the specific section/pages in scope. Find it
  from the repo if you can (`grep -RniE 'canonical|og:url|sitemap|NEXT_PUBLIC_SITE_URL' .`),
  otherwise ask.
- **What's the business goal?** Signups, sales, leads, ad revenue, brand
  authority? This decides which keywords and pages matter.
- **Who's the audience and what do they search / ask AI** to find this?
- **Which data sources are connected** (GSC via Ahrefs, Ahrefs projects,
  PostHog)? Name what's missing.
- **What's the stack?** (Next.js, Astro, a CMS, static?) This tells you where
  metadata, structured data, sitemaps, and content live — i.e. where fixes go.

## Review workflow

Pull the data, then work these dimensions. Weight by the business goal — a
content/marketing site lives on content + GEO; a SaaS app on technical health,
the money pages, and AI-answer presence for its category.

### 1. Technical SEO & crawlability

The foundation — if engines and AI crawlers can't crawl, render, and index it,
nothing else matters.

- **Indexation:** pages indexed vs submitted; accidental `noindex`, canonical
  mistakes, orphan pages, thin/duplicate pages. Cross-check GSC coverage with
  Ahrefs Site Audit.
- **Crawl health:** broken links, redirect chains/loops, 4xx/5xx, `robots.txt`
  not blocking CSS/JS or important paths, valid `sitemap.xml` referenced from
  `robots.txt`.
- **Core Web Vitals** (a ranking factor): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at
  the 75th percentile. Pull from Site Audit / CrUX; frame as a ranking + UX cost.
- **Rendering:** is critical content in the server-rendered HTML, or JS-only
  (which AI crawlers and some indexers won't execute)?
- **HTTPS, mobile-friendliness, hreflang** for international.

### 2. Rankings & keyword opportunity

Find where small effort moves the needle most, from GSC + Ahrefs:

- **Striking-distance keywords:** queries ranking **position 5–20** with real
  impressions — a title/content/internal-link nudge can pull them to page 1.
  Pull from `gsc-keywords` (filter by position) and
  `site-explorer-organic-keywords`.
- **High-impression, low-CTR pages:** strong ranking but weak clicks → the
  title/meta isn't earning the click. Cross `gsc-ctr-by-position` against
  expected CTR for the position.
- **Cannibalisation:** two pages competing for one query — consolidate or
  differentiate intent.
- **Content gaps:** keywords competitors rank for and you don't
  (`site-explorer-organic-competitors` → `keywords-explorer-*`), and questions
  your audience asks that you have no page for.
- **Decaying pages:** traffic sliding over time (`gsc-page-history`) → refresh
  candidates.

### 3. Content & on-page

- **Search intent match:** does the page give what the query wants
  (informational / commercial / transactional)? Check the live SERP
  (`serp-overview`) — if the top results are all comparison tables and you wrote
  an essay, intent is mismatched.
- **On-page fundamentals:** one clear `<h1>`, logical H2/H3 outline mapping to
  sub-questions, descriptive title (~50–60 chars) and meta description
  (~150–160), keyword and its variants used naturally, internal links with
  descriptive anchors, `alt` text.
- **Depth & freshness:** does it cover the topic more usefully than what ranks
  now, and is it current (dates, data, examples)?
- **Internal linking:** are money/priority pages well linked from relevant
  high-authority pages? Fix orphan and under-linked pages.

### 4. GEO — get surfaced and cited by AI engines

AI answers are becoming a primary discovery surface. They cite sources that are
**extractable, authoritative, and unambiguous**. Optimise for being *quoted*,
not just ranked. Measure with Brand Radar; then act on these levers:

- **Answer-first structure.** Lead sections with a direct, self-contained answer
  (the "quotable" sentence), then support it. AI extracts the crisp claim near a
  matching heading. Bury the answer and it won't be pulled.
- **Question-shaped headings.** H2/H3 phrased as the questions people ask an AI;
  add a real FAQ where it fits. This maps content to prompts.
- **Extractable formatting.** Short declarative sentences, lists, comparison
  tables, definitions, and stats **with a cited source and a date**. Concrete,
  quotable facts get picked up; vague prose doesn't.
- **Entity clarity & authority.** Unambiguous, consistent naming of the product/
  brand/people; `Organization`/`Person`/`Product` schema; consistent facts
  across the site and off-site (Wikipedia/Wikidata, LinkedIn, Crunchbase).
  Engines cite sources they can identify and trust.
- **Structured data (schema.org JSON-LD).** `Article`, `FAQPage`, `HowTo`,
  `Product`+`Offer`, `BreadcrumbList`, `Organization` — machine-readable facts
  AI and search both consume.
- **Be citable off-site.** Being referenced by sources AI already trusts (the
  domains in `brand-radar-cited-domains`) drives inclusion. Digital PR, original
  data/research, and getting listed where your category is discussed.
- **Let AI crawlers in (deliberately).** Check `robots.txt` for `GPTBot`,
  `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`,
  `CCBot` — being blocked means being excluded from those engines. Decide
  per-engine on purpose; flag accidental blocks. Consider an `llms.txt` /
  `llms-full.txt` summarising key pages for LLM consumption.
- **Freshness.** AI answers favour current sources; stale dates and dead facts
  reduce citation odds.

Ground GEO findings in Brand Radar: which competitors get cited for your core
topics, which of your pages already surface, and where your share of voice in AI
answers is lowest vs the opportunity.

### 5. Authority & backlinks

- Domain Rating and referring-domain trend vs competitors.
- **Reclaim broken backlinks** (`site-explorer-broken-backlinks`) — links
  pointing at 404s are recoverable authority.
- Toxic/spam link patterns worth disavowing (rare, but check).
- Anchor-text profile: natural and relevant, not over-optimised.

### 6. Behaviour & conversion (PostHog)

Visibility that doesn't convert is vanity. Cross ranking/traffic with PostHog:

- Which organic + AI-referral landing pages convert, which bounce.
- High-traffic, low-conversion pages → CRO + intent-match opportunity.
- Whether AI-referral traffic (ChatGPT/Perplexity referrers) is growing and
  what it does on-site — the early signal that GEO is working.

## Severity triage

Rank every finding by impact on traffic, rankings, citations, or revenue —
lead with what moves the number most.

- **Blocker** — actively suppressing visibility: money pages `noindex`'d or
  blocked in `robots.txt`, site not indexed, canonical pointing away, broken
  sitemap, AI crawlers blocked on a site that wants AI traffic, CWV failing on
  the top landing pages.
- **High** — materially costs traffic or citations: striking-distance keywords
  left on page 2, high-impression low-CTR titles on top pages, no structured
  data on pages that qualify for rich/AI results, strong content with no
  answer-first structure so AI won't cite it, major content gap vs competitors,
  decaying top page.
- **Medium** — real improvements: thin internal linking to priority pages,
  missing FAQ/schema opportunities, meta descriptions absent or truncated,
  broken backlinks to reclaim, intent-mismatched pages.
- **Nit** — polish. Prefix with `Nit:`.

## Output format

Use this structure.

```markdown
# Beacon Review — <domain / section>

## Summary

- Property & scope: what was reviewed
- Goal: the business outcome (signups / sales / leads / authority)
- Data sources used: GSC ✓ · Ahrefs ✓ · Brand Radar ✓ · PostHog ✗ (not connected)
- SEO verdict: Strong | Solid | Needs work | At risk
- GEO verdict: Cited & visible | Emerging | Largely invisible in AI answers
- Biggest lever: the single change that would do the most good

One paragraph: the main thing standing between this site and more visibility.

## Where the traffic is (data snapshot)

Key numbers pulled — top queries/pages, position distribution, CTR outliers,
AI share of voice / cited pages, organic + AI-referral conversion. Render
Ahrefs data tables/charts where `render_with` is returned.

## Findings

### 1. [Blocker|High|Medium|Nit] Title

- Dimension: Technical | Rankings | Content | GEO | Authority | Conversion
- Evidence: the query/page/metric that proves it (e.g. "'x' ranks pos 7,
  2,400 impressions/mo, 0.9% CTR")
- Problem & impact: what's wrong and what it costs (lost clicks, missed
  citations, suppressed indexation)
- Fix: concrete and specific to this site

Repeat, ordered by severity then impact.

## Optimisation plan

### Now (highest leverage, low effort)
- Concrete change → expected effect (which query/page, expected clicks/citations)

### Next
- ...

### Later
- ...

## Highest-leverage change

The one change to make first, and the result to expect.
```

## Optimisation / editing rules

When the user asks you to optimise directly, not just review:

- Make the smallest change that resolves the finding; preserve the site's voice,
  structure, and the project's content/component conventions.
- **Metadata & structured data** go through the framework's real mechanism
  (Next.js `metadata` / `generateMetadata`, Astro/Head components, the CMS
  fields) — never hard-code tags that bypass the system or duplicate what the
  framework emits.
- **Content edits** keep the author's voice and factual claims; improve
  structure, answer-first leads, headings, and internal links. Don't fabricate
  stats, testimonials, or sources — GEO rewards *verifiable* facts, and invented
  ones destroy trust and citation value.
- **Structured data** must reflect what's actually on the page (no fake reviews,
  fake FAQs, or markup that mismatches visible content — that risks a manual
  penalty). Validate against schema.org types.
- **Internal links** use descriptive, relevant anchors; don't keyword-stuff.
- **robots.txt / crawler changes** are deliberate and confirmed — blocking or
  unblocking an AI crawler is a business decision; surface it, don't just flip it.
- Never buy links, cloak, spin content, or otherwise use tactics that risk a
  penalty. If a fix would trade long-term trust for a short-term bump, don't —
  flag it instead.
- After a change, re-verify what you can: re-pull the page's structured data,
  re-render the `<head>`, and note the metric to watch (impressions, position,
  CTR, citations) so impact is measurable next sweep.

## Tone

Be concise, specific, and evidence-led. Every claim carries the query, page, or
metric behind it.

Prefer:
- "'pricing calculator' ranks position 6 with 3,100 impressions/mo but 1.1% CTR
  — the title is generic; a benefit-led rewrite should recover clicks."
- "Perplexity cites competitor.com for your core term; your page has the facts
  but buries them below 600 words of intro, so it isn't extractable — lead with
  the answer and add FAQ schema."
- "GPTBot is disallowed in robots.txt while you're trying to win AI traffic —
  that blocks inclusion in ChatGPT search."

Avoid:
- Generic SEO lectures untethered from this site's data.
- Recommending volume ("write 20 blog posts") without intent, keyword, or
  evidence.
- Any tactic that risks a penalty for a short-term gain.

## Final summary

End every review with:

1. The single highest-leverage change (and the metric it should move).
2. The one blocker that's actively suppressing visibility, if any.
3. The smallest next action the user can take right now.
