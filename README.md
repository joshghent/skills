# Product Skills

Reusable skills for Josh's product work. These are intended to be portable prompts/processes that can be copied into product repositories, agent setups, or automation workflows.

## Current skills

### `feature-blogger`

**Purpose:** turn real shipped engineering work into product content.

Use this when a product repo has recent commits and you want an agent to decide what is genuinely blog-worthy, draft dated markdown posts, and produce social snippets without inventing features.

Good fits:

- RepoWarden feature announcements
- PlanPacer product updates
- SEO posts based on actual product capabilities
- Changelog-style posts from recent commits
- Founder/build-in-public posts grounded in commits

Main guardrail: it must inspect real code, commit history, and existing site voice before writing. It should skip refactors, dependency bumps, and vague “AI wrote a feature” content unless there is user-facing value.

### `repo-sentinel`

**Purpose:** whole-repository quality, coverage, CI, security, and AI-agent fragility review.

Use this when a product has been built or maintained with AI assistance and needs a senior-engineer audit rather than a line-by-line style review.

Good fits:

- Pre-launch product hardening
- Checking whether an AI-built repo is safe to keep extending
- Finding test/coverage gaps around risky flows
- Spotting duplicated concepts, dead code, silent fallbacks, and agent slop
- Creating a ranked remediation plan before asking agents to fix things

Main guardrail: it should be evidence-based. Run the available build/test/typecheck/lint commands where possible, then rank findings by production and future-maintenance risk.

## Suggested skill gaps

These would fill useful gaps across RepoWarden, PlanPacer, and future products.

### 1. `landing-page-positioning`

A skill for reviewing a product landing page against buyer intent: headline, ICP, pain, proof, CTA, objections, pricing clarity, and SEO angle.

Why useful: Josh’s products need distribution leverage. This would convert product capabilities into clearer positioning without waiting for a full marketing sprint.

### 2. `competitor-intel-brief`

A repeatable workflow for researching direct/adjacent competitors, extracting positioning, pricing, feature gaps, customer complaints, and content angles.

Why useful: RepoWarden needs sharp differentiation from AI code review, dependency automation, AppSec, and compliance tooling.

### 3. `customer-discovery-synthesizer`

A skill for turning calls, notes, emails, support requests, or Telegram voice notes into buyer pains, objections, feature requests, testimonials, and follow-up tasks.

Why useful: helps product decisions stay grounded in real customer language rather than agent-generated assumptions.

### 4. `pricing-packaging-review`

A skill for reviewing pricing pages and product tiers against value metric, buyer segment, willingness to pay, competitor anchors, and operational cost.

Why useful: helps avoid underpricing useful automation or shipping vague “contact us” packaging too early.

### 5. `release-readiness-check`

A focused launch gate for small products: env vars, auth, billing, email, analytics, monitoring, error handling, backups, legal pages, onboarding, and rollback.

Why useful: complements `repo-sentinel` by checking product/ops readiness, not just code quality.

### 6. `support-to-product-loop`

A workflow for mining support tickets, bug reports, and user messages into product fixes, docs improvements, onboarding changes, and content ideas.

Why useful: turns operational friction into roadmap and distribution material.

### 7. `agent-task-brief-writer`

A skill for converting vague product ideas into self-contained agent implementation briefs with scope, constraints, acceptance criteria, files to inspect, and verification commands.

Why useful: improves handoffs to Claude/Codex/Hermes workers and reduces agent drift.

### 8. `security-fix-pr-writer`

A skill for taking vulnerability findings and producing small, reviewable PRs: root cause, risk, patch, regression test, release note, and customer-safe wording.

Why useful: directly supports RepoWarden’s core promise and could become a product workflow pattern.

## Suggested repository conventions

- One directory per skill: `<skill-name>/SKILL.md`.
- Keep skills product-agnostic where possible, with examples from RepoWarden/PlanPacer only where helpful.
- Each skill should include:
  - when to use it
  - inputs to collect first
  - exact commands or discovery steps
  - output format
  - safety/anti-hallucination rules
  - verification checklist
- Prefer fewer, strong skills over many narrow prompt snippets.
- If a skill creates public content, require evidence and human review before publishing.
- If a skill proposes code or operational changes, include verification commands and rollback notes.
