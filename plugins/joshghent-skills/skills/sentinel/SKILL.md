---
name: sentinel
description: Whole-repo audit ranked by production risk. Scores a capability baseline (observability, error monitoring, testing, CI/CD, previews, alerting, OIDC deploys, disaster recovery, security remediation), checks supply-chain hygiene (Dependabot, SHA-pinned actions, vendor security notices), then reviews quality, coverage and AI-agent fragility. Use when asked to audit a repo, review code quality, test coverage, weak or missing CI checks, security posture, or check whether agents can safely maintain the codebase.
argument-hint: '[optional path or area to focus on]'
---

# Sentinel: Whole-Codebase Quality and Coverage Review

Use this skill when the user wants a reusable, high-signal audit of an entire repository, especially one that is built, run, or maintained by AI agents.

The goal is not to nitpick style. The goal is to identify the code most likely to break, rot, mislead future agents, or quietly ship defects.

## Operating Principle

Act like a senior engineer reviewing a production system that may have been over-optimised for "it works now" rather than "it is safe to evolve".

Be direct, evidence-based, and practical.

Do not make broad rewrites unless the user explicitly asks. Prefer a ranked review with concrete fixes, commands, and example patches where useful.

## Default Review Scope

Review the whole repository unless the user narrows the scope.

Cover:

1. Build and CI health
2. Test execution and coverage gaps
3. Code smells and maintainability risks
4. AI-generated code slop
5. Architectural boundaries
6. Runtime, security, and data integrity risks
7. Agent maintainability: whether future AI agents can safely work in this repo
8. Documentation accuracy and drift
9. High-leverage refactors with low blast radius

## Inputs To Collect First

Before judging the code, gather repo context.

Run or inspect, where available:

```bash
pwd
git status --short
git branch --show-current
git remote -v
find . -maxdepth 3 -type f | sed 's#^\./##' | sort | head -300
```

Identify:

- Languages and frameworks
- Package managers
- Test frameworks
- CI provider
- Deployment/runtime environment
- Monorepo structure, if any
- Generated files and build outputs
- Existing coding conventions
- Critical app entry points
- Database/schema/migration tooling
- Auth, billing, email, queue, cron, or external API integrations

Do not assume the stack from filenames alone. Confirm through package files, lockfiles, config, README, CI files, and source layout.

## Capability Baseline

Score these before the detailed review. They decide whether a production
problem gets noticed, diagnosed, and fixed, so a weak score here outranks most
code smells.

Score each one **2** (in place), **1** (partial), **0** (missing), or
**Unknown**. Every score needs evidence: a config file, a workflow, an SDK init,
a runbook. Some of these live outside the repo (alert rules, backup schedules,
vendor settings). Check with the CLI or API when you have access. Otherwise mark
them Unknown and say what to confirm. Never score 2 on a guess.

| Capability | 2 means | Where to look |
|---|---|---|
| Centralised observability | Logs, metrics, and traces from every service land in one tool, with request IDs that join them up. | Logger setup, OpenTelemetry config, `observability` in `wrangler.jsonc`, Logpush or drain config, Datadog/Grafana/Axiom/New Relic SDKs |
| Error monitoring | Unhandled errors from frontend and backend reach an error tracker, tagged by release, with source maps. | Sentry/Bugsnag/Rollbar init, DSN in env examples, source map upload in CI |
| Automated testing | Tests run on every PR, block merge, and cover the critical paths listed below. | CI workflows, branch protection, test files next to critical modules |
| CI/CD | Merging to the default branch deploys with no manual step, and the PR gate runs build, types, lint, and tests. | Deploy workflows, platform git integration, release scripts |
| Preview environments | Each PR gets its own deploy URL. | Vercel/Netlify/Cloudflare Pages previews, `wrangler versions upload`, review apps |
| Production alerting | A named person or channel gets notified on error rate, uptime, and failed jobs. | Alert rules as code, uptime monitors, PagerDuty/Opsgenie/Slack hooks, cron failure alerts |
| OIDC deployment auth | CI gets short-lived cloud credentials through OIDC instead of stored long-lived keys. | `permissions: id-token: write`, `role-to-assume`, workload identity. If the platform has no OIDC option, score on whether tokens are scoped to one project and expire |
| Disaster recovery tests | Backups exist, a restore has been tested in the last quarter, and a runbook says how. | Backup config, D1 Time Travel, point-in-time recovery, R2/S3 versioning, `docs/runbooks` |
| Security remediation | Alerts are on, high and critical ones get fixed inside a stated time, and nothing sits open for months. | Dependabot alerts, code scanning, secret scanning, `SECURITY.md`, age of open alerts |

### Supply-chain checks

Score these as part of security remediation, and list every gap as its own
finding.

- **Dependabot.** Check that alerts and security updates are on, and that
  `.github/dependabot.yml` covers every ecosystem in the repo, including
  `github-actions` and `docker`. Group minor and patch updates to keep the
  noise down, and set a `cooldown` of at least 7 days so a freshly published,
  possibly compromised release isn't proposed the day it ships.

  ```bash
  gh api repos/{owner}/{repo}/vulnerability-alerts -i 2>&1 | head -1   # 204 = alerts on
  gh api repos/{owner}/{repo} --jq .security_and_analysis
  cat .github/dependabot.yml 2>/dev/null
  ```

- **SHA-pinned actions.** Every third-party `uses:` should point at a full
  40-character commit SHA with the version in a comment
  (`actions/checkout@<sha> # v4.2.2`). A tag can be moved to point at new code.
  A SHA can't.

  ```bash
  grep -rnE 'uses: [^ ]+@' .github/workflows | grep -vE '@[0-9a-f]{40}'
  ```

  Also flag workflows with no `permissions:` block and any
  `pull_request_target` workflow that checks out the PR's code.

- **Secret and code scanning.** Secret scanning and push protection should be
  on. Code scanning (CodeQL or similar) should run for the languages it
  supports.

- **Vendor security notices.** List each third-party service the code depends
  on, found from SDKs, env vars, and infrastructure config. For each one, check
  whether someone will hear about that vendor's security issues: a subscription
  to its security or status page, or an owner listed in `SECURITY.md` or the
  runbook. Self-hosted software (Postgres, Redis, nginx, base images) needs a
  watched advisory feed. You usually can't see this from the repo. List each
  vendor as "needs confirmation" with who should subscribe, and don't invent
  page URLs.

## CI And Build Review

Inspect common CI locations:

```bash
ls -la .github/workflows 2>/dev/null || true
ls -la .gitlab-ci.yml bitbucket-pipelines.yml azure-pipelines.yml 2>/dev/null || true
```

Review whether CI checks:

- Install dependencies reproducibly
- Build the app
- Run unit tests
- Run integration tests where applicable
- Run type checking
- Run linting/format checks
- Run database migration checks, if applicable
- Run security/dependency checks, if present
- Upload or enforce coverage
- Block merges on failing checks
- Pin third-party actions to a full commit SHA with a version comment, not a tag
- Set a least-privilege `permissions:` block
- Avoid leaking secrets
- Cache safely without masking dependency issues

If CI is missing, weak, or only runs superficial checks, flag it as a top-level reliability risk.

## Test And Coverage Execution

Find test commands from package files and docs before guessing.

Inspect likely files:

```bash
cat package.json 2>/dev/null || true
cat pyproject.toml 2>/dev/null || true
cat pytest.ini 2>/dev/null || true
cat go.mod 2>/dev/null || true
cat Cargo.toml 2>/dev/null || true
cat pom.xml 2>/dev/null || true
cat build.gradle 2>/dev/null || true
```

Run the commands those files define. Don't guess at script names.

If commands fail because dependencies are missing, install only if the repo convention is clear and safe. Otherwise report the exact blocker and infer from static inspection.

## Coverage Gap Analysis

Do not treat coverage percentage as the main signal. Find meaningful untested
risk. Follow the coverage map and priority list in `references/checklists.md`.

## AI-Agent Fragility Review

Because the repo may be built and maintained by AI agents, check for fragility patterns that commonly emerge from agentic coding.

Flag:

- Multiple competing implementations of the same concept
- Dead code left behind after a change
- Inconsistent naming for the same domain concept
- "Temporary" abstractions that became permanent
- Overly defensive code on trusted paths
- Try/catch blocks that hide real failures
- Broad `catch` or empty catch blocks
- Silent fallbacks that make debugging impossible
- Comments explaining obvious code
- Comments that no longer match behaviour
- Excessive TODOs without ownership
- Placeholder logic in production paths
- Duplicated validation rules across client/server/backend
- Schema, type, and runtime validation drifting apart
- Business rules embedded in UI components
- AI-generated "just in case" branches
- Tests that validate mocks rather than behaviour
- Code that passes tests only because tests mirror the implementation
- Overuse of `any`, `unknown`, casts, non-null assertions, or equivalent escape hatches
- Inconsistent error shapes
- Magic strings for statuses, roles, plans, event names, or permissions
- Large files where agents have kept appending instead of extracting cohesive units
- New frameworks or libraries introduced for small problems
- Files with mixed responsibilities: UI + data access + business rules + side effects

## Code Smell Rubric

Look for structural issues before cosmetic issues. Grade severity with the
rubric in `references/checklists.md`, and do not bury the user in low-value
style comments.

## Maintainability Bar

Apply a strict maintainability standard.

Flag:

- Files approaching or exceeding 1,000 lines unless strongly justified
- Functions that cannot be understood in one screen
- Deep nesting that could use guard clauses or extraction
- Modules that mix unrelated responsibilities
- "God" services or utility files
- Implicit coupling through shared mutable state
- App logic spread across many tiny files with no clear boundary
- App logic crammed into one large file
- Repeated code that suggests a missing domain abstraction
- Abstractions that are more complex than the duplication they replace

Prefer boring, obvious, local code over clever abstractions.

## Architecture Review

Build a simple mental model of the repo:

- Entry points
- Domain modules
- Data layer
- API layer
- UI layer
- Background workers
- External integrations
- Shared libraries
- Config and environment boundaries

Then identify whether the actual code follows that model.

Check for:

- Directional dependency violations
- UI importing server-only logic
- Business logic living in route handlers
- Data access leaking everywhere
- Feature modules that cannot be tested independently
- Unclear domain boundaries
- Multiple sources of truth
- Circular dependencies
- Config spread across code instead of centralised
- Weak separation between commands, queries, and side effects

## Security And Production Safety

Review for:

- Secret handling
- Environment variable validation
- Auth checks
- Authorization checks
- Injection risks
- SSRF or unsafe URL fetching
- Unsafe file handling
- Unsafe deserialization
- Missing CSRF protection where relevant
- Overly broad CORS
- Sensitive data in logs
- Webhook signature verification
- Rate limiting on expensive or sensitive endpoints
- Dependency risk
- Admin/debug routes exposed in production
- Unsafe default config
- Data retention and deletion behaviour

Do not claim a vulnerability unless you can point to evidence. If uncertain, mark it as "needs verification" and explain how to verify.

## Observability And Operability

Check whether a production incident could be diagnosed.

Review:

- Structured logging
- Error reporting
- Metrics
- Health checks
- Job failure visibility
- Retry/dead-letter handling
- Audit logs for sensitive actions
- Correlation/request IDs
- User-impacting error messages
- Runbooks or operational docs

Flag code that fails silently or makes incidents hard to trace.

## Documentation Drift

Inspect README, docs, comments, architecture notes, env examples, and CI docs.

Flag:

- Setup instructions that do not match actual commands
- Missing required environment variables
- Undocumented background jobs
- Undocumented deployment assumptions
- Outdated architecture descriptions
- Comments that contradict code
- Missing "how to test" guidance
- Missing "how to release" guidance

For AI-maintained repos, recommend a short `AGENTS.md` or equivalent when absent.

It should include:

- Project overview
- Main commands
- Test strategy
- Important architecture boundaries
- Dangerous files or flows
- Coding conventions
- What not to change casually
- Release/deployment notes

## Review Workflow

Follow this order.

### 1. Baseline

Collect repo structure, stack, scripts, CI, and current git state. Score the
capability baseline and run the supply-chain checks.

### 2. Execute Checks

Run the existing check suite where possible:

- install check, if needed and safe
- build
- typecheck
- lint
- tests
- coverage
- security/dependency checks, if present

Capture exact commands and results.

### 3. Static Review

Inspect source files, starting with:

- app entry points
- routes/controllers/handlers
- domain/business logic
- persistence layer
- auth/billing/permissions
- background jobs/webhooks
- external integrations
- tests
- CI config
- env/config

### 4. Coverage Gap Review

Compare source modules to tests and coverage output.

### 5. Risk Ranking

Rank findings by production risk and future-maintenance risk.

### 6. Action Plan

Give a practical remediation plan in phases.

## Output Format

Write the report using `references/report-template.md`. Read it before you
start writing.

## Editing Rules

When asked to fix issues directly:

- Keep behaviour unchanged unless fixing a clear bug.
- Prefer minimal focused edits.
- Preserve local style.
- Do not introduce broad abstractions without evidence.
- Add or update tests for any behaviour change.
- Do not hide failures with broad fallbacks.
- Do not add comments that merely narrate obvious code.
- Remove AI-generated slop when safe.
- Do not rewrite working code just to satisfy personal taste.
- Do not change public APIs, database schemas, or deployment config without calling out risk.
- If a change has migration or compatibility impact, state it clearly.

## Approval Bar

A repo passes this review only if:

- CI meaningfully checks build, tests, and types/lint where relevant.
- Critical paths have targeted tests.
- Coverage is not obviously misleading.
- Main domain concepts have one clear implementation.
- Error handling makes failures visible.
- Production-sensitive flows are explicit and testable.
- Future agents can understand where to make changes safely.
- There are no obvious high-severity security, data integrity, or release risks.
- No capability-baseline item scores 0 without a recorded reason, and every third-party action is pinned to a SHA.

If the repo "works" but is fragile, say so.

## Tone

Be concise, direct, and useful.

Use strong language for real risks. Do not dramatise minor issues.

Prefer:

- "This is a release blocker because..."
- "This is likely to break when..."
- "This test gives false confidence because..."
- "This is agent-fragile because a future edit will probably..."

Avoid:

- Cosmetic nitpicking before structural issues
- Vague advice
- Generic best-practice lectures
- Large speculative rewrites
- Praise that is not tied to evidence

## Final Summary

End with:

1. The highest-risk issue
2. The highest-leverage fix
3. The smallest next action