---
name: design-review
description: Expert design review of a UI for conversion, UI/UX craft, accessibility, performance, and SEO. Judges against Apple, Financial Times, and OpenAI/ChatGPT design standards and strips AI design slop. Use when the user wants a design-review, UI/UX audit, conversion review, or to make an interface stop looking AI-generated.
---

# Design Review: Conversion-Grade UI/UX Critique

Use this skill when the user wants a high-signal review of a user interface — a
landing page, marketing site, signup or checkout flow, dashboard, or any
product screen — judged the way a senior product designer at a company that
ships beautiful, high-converting software would judge it.

The goal is not to repaint everything in your own taste. The goal is to find
what costs conversions, frustrates users, excludes people, loads slowly, hides
from search engines, or simply reads as generic AI-generated slop — and to say
exactly how to fix it, ranked by impact.

## Operating Principle

Act like a design lead reviewing work before it ships to customers. You care
about the business outcome (conversion, trust, retention) *and* the craft
(hierarchy, restraint, accessibility). The two are not in tension — sloppy
craft leaks money.

Be direct and specific. Tie every critique to a consequence: a user who can't
complete a task, a visitor who bounces, a person using a screen reader who gets
stuck, a search engine that can't index the page. Vague taste assertions
("make it pop") are banned.

**Describe problems and their impact, not just prescriptions.** "The primary
action competes with three equally-weighted buttons, so users don't know where
to click" beats "make the button blue." Offer a concrete fix as a *suggestion*,
but lead with the problem so the designer can solve it their way.

Do not rewrite working code unless the user explicitly asks. Default to a
ranked critique with evidence and example fixes.

## Design North Stars

Judge the work against the houses that define modern product taste. Name the
principle you're invoking so the feedback is teachable, not just opinion.

### Apple — Human Interface Guidelines

- **Clarity, deference, depth.** Content is the hero; chrome defers to it.
  Legible text, precise icons, generous negative space. Depth communicates
  hierarchy, not decoration.
- **Hierarchy, harmony, consistency.** Every screen has one obvious focal
  point. Elements share a visual language. The same action looks the same
  everywhere.
- Concrete rules worth enforcing: **8pt spacing grid**; touch targets
  **≥ 44×44pt**; never rely on color alone to convey meaning; respect Reduce
  Motion and Reduce Transparency; type that reflows without truncation.

### Financial Times — Origami / editorial design

- **Serif headline + sans data.** A serif display face for authority and
  voice, a clean sans (FT uses Metric) for UI, data, and tables. Not one
  undifferentiated font doing every job.
- **Information density done right.** Dense but scannable: a deliberate grid,
  controlled column widths, and a clear three-level reading order
  (headline → standfirst/deck → body) on every page.
- **Trust through restraint.** A coherent, limited palette (FT's warm
  "paper" background is part of its brand recall), accents used sparingly,
  everything traced to design tokens — no ad-hoc hex values or magic numbers.

### OpenAI / ChatGPT — calm minimalism

- **Whitespace is the bold move.** When in doubt, remove. Beauty in the empty
  space; let content breathe.
- **One dominant control.** The interface centers a single primary action
  (the composer). Power and options are progressively disclosed, not dumped on
  screen. Minimal chrome, subtle dividers over heavy borders.
- **Restraint in color and motion.** A neutral, monochrome-leaning palette with
  color reserved for emphasis. Motion is calm and purposeful, never decorative.
- **One typeface, one type hierarchy** that stays readable across long content.

These are north stars, not a costume. The point is the *underlying discipline*
— hierarchy, restraint, tokens, trust — not literally copying FT's salmon
background onto a SaaS dashboard.

## AI Design Slop — The Smell Test

AI-generated UIs share a recognizable look because models output "the median of
every Tailwind tutorial" unless given explicit constraints. Flag slop
explicitly — **three or more tells means the UI reads as AI-generated** and
undermines trust.

Tells, by category:

**Color**
- Indigo / violet / purple as the default accent (`indigo-500`, `violet-600`)
  — the single most common tell.
- Purple→blue/cyan mesh or aurora gradients; gradient text used as fake
  hierarchy; colored glows behind cards.
- The same low-opacity drop shadow on every element.

**Typography**
- Inter / Geist / Space Grotesk on everything, often Space Grotesk + Instrument
  Serif + Geist together.
- One hero word in serif italic for "elegance."
- No real type scale — "bigger = more important" instead of a defined ramp.
- All-caps labels used as the only structuring device.

**Layout**
- The centered-hero template: pill badge → vague H1 → one-line subhead → two
  buttons.
- Generic hero followed by exactly three identical feature cards.
- Everything-is-a-card, cards nested in cards, colored left-border cards.
- Obligatory "1 · 2 · 3" numbered steps and a stat banner ("10k+ users /
  99.9% uptime") with no substance.
- Bento-grid overuse; glassmorphism + pastel gradients; uniform rounded-
  everything.
- Emoji as section headings or nav icons.

**Content & behavior**
- Stock or AI imagery; fake testimonials with generic avatars.
- Dead hover states; one uniform fade-in on everything.
- Inconsistent spacing that reveals there is no spacing system underneath.

When you flag slop, name the specific tell and the fix that adds intent: a real
palette derived from the brand, a defined type scale, a layout that reflects
*this* product's actual content rather than a template.

## What to Review

Cover these dimensions. Weight them by what the surface is for — a marketing
page lives or dies on conversion and performance; an in-product dashboard on
UI/UX craft and accessibility.

1. Conversion & messaging
2. UI/UX craft (hierarchy, layout, typography, color, spacing, states)
3. Accessibility (WCAG 2.2 AA)
4. Performance (Core Web Vitals)
5. SEO & metadata
6. AI-slop / craft authenticity
7. Responsive behavior across viewports
8. Content quality and microcopy

## Inputs to Establish First

Before judging anything, know what you're looking at and who it's for.

- **What surface is this?** Marketing/landing page, signup, checkout, pricing,
  onboarding, dashboard, settings, content page?
- **Who is the user and what's the one job** they came to do on this screen?
- **What's the single success metric?** Sign-ups, purchases, activation, task
  completion, time-on-task?
- **Is there a live URL or running dev server**, or are you reviewing source
  files only?
- **What's the stack?** (Next.js, Tailwind, a component library, a CMS?) This
  tells you where tokens, metadata, and image handling live.

Find the dev server and stack from the repo before guessing:

```bash
cat package.json 2>/dev/null | grep -A20 '"scripts"' || true
git grep -lE "tailwind|next|vite|astro|remix|sveltekit" -- '*.json' '*.config.*' 2>/dev/null | head
```

If a dev server isn't already running and the user gave no URL, ask for the URL
or start the project's dev command, then review live. If you genuinely can't run
it, review the source and say which checks (live CWV, contrast as rendered,
keyboard nav, responsive behavior) you could not verify.

## Live Review Workflow (preferred)

When you have a URL or running app, inspect the real rendered experience before
reading code — the rendered result is the source of truth. Use the
`chrome-devtools` MCP tools (navigate, resize, screenshot, take_snapshot,
list_console_messages, lighthouse_audit, performance traces) where available;
otherwise describe the equivalent manual checks for the user to run.

Work through these phases in order:

### Phase 1 — Interaction & primary flow

- Navigate to the page and execute the **primary user flow** end to end (e.g.
  land → understand value → click CTA → complete signup).
- Exercise interactive states: default, hover, focus, active, disabled,
  loading, empty, error, success. Note any dead or missing states.
- Confirm destructive actions ask for confirmation.
- Assess perceived performance: does the UI respond immediately, show
  skeletons, avoid jank?

### Phase 2 — Responsiveness

Resize and screenshot at three widths. Verify no horizontal scroll, no
overlap, no truncated content, and that tap targets stay large enough on
mobile.

- **1440px** — desktop
- **768px** — tablet
- **375px** — mobile

### Phase 3 — Visual polish

- Alignment to a grid; consistent spacing from a scale (multiples of 4/8).
- One clear focal point and a deliberate visual hierarchy that guides the eye
  (F-pattern for text-heavy, Z-pattern for sparse hero pages).
- Typographic hierarchy: defined scale, limited weights, comfortable line
  length (~45–75 chars) and line-height (1.5–1.7 for body).
- Color: coherent palette, sufficient contrast, accents used with intent.
- Image and icon quality; consistent corner radii and shadows.

### Phase 4 — Accessibility (WCAG 2.2 AA)

- **Keyboard:** Tab through the whole page. Logical order, nothing
  unreachable, no traps, visible focus on every interactive element (no bare
  `outline: none`). Enter/Space operate controls.
- **Contrast:** text **4.5:1** (3:1 for large ≥18pt / ≥14pt bold); non-text UI
  (borders, focus rings, icons, control states) **3:1**.
- **Targets (new in 2.2):** interactive targets **≥ 24×24 CSS px** (Apple/
  mobile best practice is 44px).
- **Focus not obscured (new in 2.2):** sticky headers/overlays must not fully
  hide the focused element.
- **Semantics:** real landmarks and headings, labels tied to inputs, `alt` on
  meaningful images (empty `alt` for decorative), accessible names on icon-only
  buttons.
- **ARIA:** prefer native HTML. Flag redundant roles, `aria-hidden` on
  focusable elements, positive `tabindex`, and ARIA reimplementations of native
  controls.
- **Motion:** honor `prefers-reduced-motion` (best practice); any auto-moving
  content can be paused/stopped (WCAG 2.2.2, Level A).
- Run a `lighthouse_audit` accessibility pass where the tool is available and
  reconcile its findings with your manual checks.

### Phase 5 — Robustness

- Submit forms with empty, invalid, and overlong input; expect inline
  validation on blur and plain-language errors.
- Stress content: very long strings, missing data, zero/empty and large-N
  states.
- Confirm loading, empty, and error states all exist and look intentional.

### Phase 6 — Performance (Core Web Vitals)

Measure, don't guess. Run a Lighthouse/performance trace where available and
report against current thresholds (75th percentile):

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| **LCP** (largest contentful paint) | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| **INP** (interaction to next paint) | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** (cumulative layout shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

Supplementary: FCP ≤ 1.8s, TTFB ≤ 0.8s, TBT ≤ 200ms.

Common causes and fixes to check for:
- **LCP:** hero image not preloaded or lazy-loaded above the fold, render-
  blocking CSS/JS, slow TTFB. Fix: `fetchpriority="high"` + preload the LCP
  image, inline critical CSS, defer non-critical JS.
- **CLS:** images/embeds without width/height or `aspect-ratio`, web-font swap,
  injected banners. Fix: reserve space; set dimensions; `font-display: swap`
  with preloaded fonts.
- **INP:** long main-thread tasks, heavy JS, oversized DOM, slow hydration.
  Fix: code-split, break up long tasks, reduce DOM depth.

Performance *is* a conversion lever — Google/Deloitte found a 0.1s mobile speed
improvement lifted retail conversions ~8%. Frame perf findings in those terms.

### Phase 7 — SEO & metadata

- Unique `<title>` (~50–60 chars) and `meta description` (~150–160 chars).
- Exactly one `<h1>`, then a logical, unskipped H1→H2→H3 outline.
- Semantic HTML5 landmarks (`header`, `nav`, `main`, `footer`, `article`).
- `rel="canonical"` on every page; deliberate `noindex`/`nofollow` only where
  intended.
- Descriptive `alt` text; descriptive anchor text (never "click here").
- Open Graph (`og:title`, `og:description`, `og:image` ≥ 1200×630, `og:url`,
  `og:type`) and Twitter card (`summary_large_image`).
- JSON-LD structured data appropriate to the page (Organization, Article,
  Product + Offer, BreadcrumbList, FAQPage).
- `sitemap.xml` and `robots.txt` present and not blocking CSS/JS; HTTPS;
  mobile-friendly.

### Phase 8 — Console & content

- Check the browser console for errors and warnings (`list_console_messages`).
- Proofread visible copy: clarity, grammar, consistent terminology, honest
  microcopy on buttons and errors.

## Conversion Review (give this real weight)

For any page whose job is to convert, judge it against these heuristics and name
the principle:

- **5-second value prop.** Within ~5 seconds above the fold, can a first-time
  visitor say what this is, who it's for, and why it's better? The headline
  should state a benefit, not a slogan.
- **One primary CTA per view** (Hick's Law — more choices, slower decisions).
  Secondary actions visibly de-emphasized. Repeat the primary CTA at natural
  scroll stops with action/benefit copy ("Start free trial", not "Submit").
- **Visual hierarchy guides the eye** to that CTA — whitespace isolates it,
  contrast draws to it.
- **Message match.** If traffic comes from an ad or link, the headline matches
  the promise that brought them.
- **Friction reduction in forms** (Baymard): aim for ≤ ~8 fields; one "Full
  name" field; hide optional fields; offer guest checkout; inline validation;
  don't ask for what you don't need yet.
- **Trust & persuasion near the decision point** (Cialdini): social proof
  (real logos, testimonials, numbers), authority signals, security/trust marks
  by the form, and *honest* scarcity only (no fake countdown timers).
- **Aesthetic-usability + minimalist design** (Nielsen heuristics): remove
  anything that doesn't serve the decision.

## Severity Triage

Rank every finding so the user knows what to fix first. Lead with what costs
the most conversions, excludes the most users, or most undermines trust.

- **Blocker** — breaks the primary task, fails the law (a11y), or guarantees
  lost conversions: CTA that doesn't work, unreadable contrast, form that
  can't be completed by keyboard, broken mobile layout, LCP > 4s on the money
  page.
- **High** — materially hurts conversion, usability, or trust: weak/buried
  value prop, competing CTAs, no visible focus states, CLS that moves the
  button, missing meta/OG on a shared page, obvious AI-slop on a hero.
- **Medium** — real craft and clarity issues: inconsistent spacing, weak type
  hierarchy, missing empty/error states, thin microcopy, non-ideal image
  formats.
- **Nit** — polish worth noting but not blocking. Prefix with `Nit:`.

## Output Format

Use this structure.

```markdown
# Design Review

## Summary

- Surface: marketing page | signup | checkout | dashboard | ...
- Primary job: the one thing the user came to do
- Verdict: Ship | Ship with fixes | Needs work | Not ready
- Slop check: Clean | Some tells | Reads as AI-generated (N tells)
- Biggest lever: the single change that would do the most good

One paragraph: the main thing standing between this UI and great.

## What's Working

Specific things done well, tied to why they work. Start here — be honest, not
flattering.

## Findings

### 1. [Blocker|High|Medium|Nit] Title

- Dimension: Conversion | UI/UX | Accessibility | Performance | SEO | Slop | Responsive | Content
- Where: page/route, component, viewport, or selector — with a screenshot if visual
- Problem & impact: what's wrong and the consequence (lost conversion, excluded user, slow load)
- Principle: the named heuristic or standard it violates (e.g. Hick's Law, WCAG 1.4.3, Apple 8pt grid)
- Suggested fix: concrete, but framed as one way to solve it

Repeat, ordered by severity then impact.

## Measured Results

| Check | Result | Threshold | Pass? |
|---|---|---|---|
| LCP | 3.2s | ≤ 2.5s | No |
| INP | 180ms | ≤ 200ms | Yes |
| CLS | 0.04 | ≤ 0.1 | Yes |
| Contrast (body on bg) | 3.9:1 | ≥ 4.5:1 | No |
| Lighthouse a11y | 86 | — | — |

Note any check you couldn't run and why.

## Fix Plan

### Now (highest leverage, low effort)
- Concrete change → expected effect

### Next
- ...

### Later
- ...

## Highest-Leverage Change

The one change to make first, and the result to expect from it.
```

## Editing Rules

When the user asks you to fix issues directly, not just review:

- Make the smallest change that resolves the finding; preserve existing
  behavior and the project's component and token conventions.
- Use the project's design tokens / theme — never hard-code colors, spacing, or
  font sizes that bypass the system.
- Don't introduce a new component library, CSS framework, or icon set to solve
  a small problem.
- Fix accessibility with native HTML first; reach for ARIA only when there's no
  native equivalent.
- For images, set dimensions and use the project's existing image component /
  optimization pipeline.
- Verify visually after the change (re-screenshot the relevant viewport) and
  re-run the relevant measurement (Lighthouse, contrast) where you can.

## Tone

Be concise, specific, and useful. Strong language for real problems; no drama
over nits.

Prefer:
- "This loses conversions because the primary action competes with two equally
  weighted buttons."
- "A keyboard user can't reach checkout — this fails WCAG 2.1.1 and blocks the
  flow."
- "Three slop tells on the hero (indigo gradient, generic 3-card row, emoji
  headings) make this read as templated; here's how to give it intent."

Avoid:
- Vague taste assertions with no consequence.
- Cosmetic nits before structural and conversion issues.
- Generic best-practice lectures untethered from this specific UI.
- Praise not tied to evidence.

## Final Summary

End every review with:

1. The single highest-leverage change.
2. The one accessibility or conversion blocker that must not ship.
3. The smallest next action the user can take right now.
