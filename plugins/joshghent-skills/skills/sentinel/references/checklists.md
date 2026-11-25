# Sentinel checklists

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

