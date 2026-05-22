---
name: repo-sentinel
description: Whole-codebase quality, coverage, CI, and AI-agent fragility review for products built or maintained by AI agents.
---

# Repo Sentinel: Whole-Codebase Quality & Coverage Review

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
- Use pinned versions rather than floating, fragile actions
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

Run the most appropriate commands available.

Examples:

```bash
npm test
npm run test
npm run test:coverage
npm run typecheck
npm run lint

pnpm test
pnpm test -- --coverage
pnpm typecheck
pnpm lint

yarn test
yarn test --coverage

pytest
pytest --cov

go test ./...
go test ./... -cover

cargo test

mvn test
./gradlew test
```

If commands fail because dependencies are missing, install only if the repo convention is clear and safe. Otherwise report the exact blocker and infer from static inspection.

## Coverage Gap Analysis

Do not treat coverage percentage as the main signal. Find meaningful untested risk.

Create a coverage map:

1. List production modules.
2. List corresponding test files.
3. Identify critical paths with no direct tests.
4. Identify tests that only snapshot, mock everything, or assert implementation details.
5. Identify areas where tests exist but do not exercise failure modes.
6. Identify end-to-end gaps around user-critical flows.

Prioritise missing coverage for:

- Authentication and authorization
- Payment, billing, plans, limits, quotas
- Data writes and migrations
- Background jobs, queues, crons, webhooks
- Email/SMS/notification sending
- External API integrations
- Error handling and retries
- Permission boundaries
- Multi-tenant data isolation
- File upload/download
- Caching and invalidation
- Rate limiting
- Date/time logic
- Money, tax, currency, and rounding logic
- AI-agent actions that mutate production state
- Any code that deletes, archives, emails, charges, publishes, or deploys

For each gap, provide:

- File or module
- Risk
- Suggested test type: unit, integration, contract, end-to-end, smoke, property-based, or regression
- A minimal first test to add
- Whether it should block release

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

Look for structural issues before cosmetic issues.

### High Severity

Report as high severity when you find:

- Auth or tenant boundary ambiguity
- Business-critical logic without tests
- Data loss risk
- Race conditions in write paths
- Non-idempotent webhook/job handlers
- Broken error handling that hides production failures
- Build or CI failures
- Type checking disabled or bypassed in critical code
- Secrets committed or logged
- Dangerous production defaults
- Migrations that are not reversible or safe
- Critical code paths that only work in the happy path
- External API calls without timeout/retry/backoff where failure is expected
- Unclear ownership of side effects

### Medium Severity

Report as medium severity when you find:

- Duplicated business logic
- Poor module boundaries
- Large files trending toward unmaintainability
- Inconsistent patterns across similar modules
- Missing integration tests
- Flaky or slow tests
- Weak observability
- Error messages that are not actionable
- Overly coupled components
- Hard-to-change config
- Risky dependency choices
- Excessive branching and nested control flow
- Weak input validation

### Low Severity

Report as low severity only after higher-risk issues are covered:

- Naming inconsistencies
- Minor formatting drift
- Non-critical comments
- Small duplication
- Local readability improvements
- Minor dependency cleanup

Do not bury the user in low-value style comments.

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

Collect repo structure, stack, scripts, CI, and current git state.

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

Use this exact output structure.

```markdown
# Repo Sentinel Review

## Executive Summary

- Overall risk: Low | Medium | High | Critical
- CI health: Pass | Partial | Fail | Missing | Not run
- Test health: Strong | Adequate | Weak | Missing | Not run
- Coverage confidence: Strong | Adequate | Weak | Misleading | Unknown
- Agent-maintainability: Strong | Adequate | Fragile | Dangerous

One paragraph summary of the main risk.

## Commands Run

| Command | Result | Notes |
|---|---:|---|
| `command here` | Pass/Fail/Skipped | concise note |

If no commands could be run, explain why.

## Top Findings

### 1. Finding title

- Severity: Critical | High | Medium | Low
- Category: CI | Coverage | Code smell | Architecture | Security | Data | AI-agent fragility | Docs
- Evidence: file paths, functions, commands, or observed behaviour
- Why it matters: concrete production or maintainability risk
- Recommended fix: specific action
- Minimal first step: smallest useful change
- Release blocker: Yes | No | Depends

Repeat for each material finding.

## Coverage Gaps

| Area | Current evidence | Risk | Suggested test |
|---|---|---|---|
| module/flow | test presence or absence | why it matters | first useful test |

## AI-Agent Fragility Map

| Pattern | Evidence | Risk | Fix |
|---|---|---|---|
| duplicated concept / dead code / unsafe fallback | path | issue | fix |

## Code Smells Worth Fixing

Group by theme. Avoid cosmetic noise.

## Good Signs

List the things that are already solid and worth preserving.

## 30/60/90 Minute Fix Plan

### First 30 minutes

Highest leverage changes that reduce risk quickly.

### Next 60 minutes

Medium-sized improvements.

### Next 90 minutes

Bigger refactors or test additions.

## Suggested Follow-Up Tasks

- [ ] Task phrased as an actionable engineering ticket
- [ ] Task phrased as an actionable engineering ticket
```

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