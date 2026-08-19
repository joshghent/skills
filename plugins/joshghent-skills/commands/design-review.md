---
description: Review a UI for conversion, UI/UX, accessibility, performance, and SEO — and strip AI design slop.
argument-hint: [url, route, file/dir, or area to focus on]
---

Use the `design-review` skill to review the design.

Target: $ARGUMENTS

If a URL or local dev URL is given, review it live in the browser. If a file or
directory is given, review that component or page. If nothing is given, find the
running dev server or the main entry UI and review the most important screens
(landing/marketing page, primary signup or checkout flow, and one core
in-product view).

Follow the skill end to end: establish what you're reviewing and who it's for,
inspect the live experience first where possible (responsive viewports,
interaction states, keyboard nav, console), then judge it against the skill's
standards — conversion, UI/UX craft, accessibility (WCAG 2.2 AA), performance
(Core Web Vitals), and SEO — while calling out AI design slop. Return the review
in the skill's output format, ranked by impact, ending with the single highest-
leverage change.
