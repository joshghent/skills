---
name: groundwork
description: Local development readiness for a repo. Walks the fresh-clone path for real (install, secrets, local services, migrate and seed, run, test, lint, build, reset), scores each step, finds gaps by diffing the code against the docs, env examples, Compose and CI, checks test coverage and whether deploys are automated, then fixes the gaps, asking before structural changes, and opens one PR with a before/after scorecard. Also checks that AGENTS.md exists, is small, and is linked from CLAUDE.md. Use when asked to make a repo easy to run locally, fix onboarding or setup, remove dependence on a shared dev database, add seed data or a reset workflow, or check whether a new engineer or agent could get the project running, or check test coverage and deployment automation.
---

# Groundwork: Local Development Readiness

Use this skill to make a repository easy for any engineer, or any agent, to run
from a fresh clone, without undocumented knowledge, someone else's machine, or a
shared mutable development environment.

The goal is a repo that **demonstrably** works locally, not a README that claims
it does. A step counts as fixed only when a clean re-run of it passes.

## Operating principle

Act like a careful new joiner on their first day who writes down every
stumble, then like the senior engineer who removes those stumbles with the
smallest change that works. Prefer the repo's existing conventions and tools.
Add infrastructure only when it removes a real gap. Never use production or
customer data. Never point a destructive command at anything that isn't local.

## Modes

- **Fix** (default): audit, apply safe fixes, **pause and ask** before
  structural changes, verify from clean, open one PR.
- **Audit only**: sections 0 to 4. Produce the scorecard and the proposed
  changes, change nothing. Use when the user says "audit", "analysis only" or
  "dry run".

## 0. Set up isolation

Work in a fresh worktree from the default branch so the walkthrough sees what a
new clone sees, not the user's warm checkout with its local `.env`, caches and
running containers.

```bash
git -C <repo> worktree add ../<repo>-groundwork -b chore/groundwork origin/main   # or origin/master
```

Do **not** copy or link the user's `.env` into it. The whole point is to find
out what a clone without it is missing. You may read the user's real `.env`
(names only, never print values) to learn which variables people actually set.

## 1. Gather context, never guess

Read before running anything:

- README, `CONTRIBUTING`, `docs/`, `AGENTS.md`, `CLAUDE.md`
- manifests and lockfiles (detect the package manager from the lockfile, use
  only that one)
- runtime pins: `.nvmrc`, `.tool-versions`, `.mise.toml`, `.python-version`,
  `engines`, Dockerfile `FROM`, `go.mod`
- `.env.example` / `.env.sample` / `.env.template`
- `docker-compose*.yml` / `compose*.yml`, devcontainer config
- migrations, seeds, fixtures, factories
- task runners: `package.json` scripts, Makefile, `justfile`, `scripts/`, `bin/`
- **CI config** (`.github/workflows`, etc.)

**CI is the reference environment.** It already boots the project from nothing
on every push: which runtime versions, which services, which env vars, which
commands in which order. Treat every difference between CI and the documented
local path as a candidate gap.

In a monorepo, do all of this per app or package that someone would run.

## 2. Find gaps mechanically

Run these comparisons. Each mismatch is a finding with evidence.

**Env vars: code vs `.env.example` vs docs vs CI.**

```bash
# What the code reads (adapt the pattern to the stack)
grep -RhoE 'process\.env\.[A-Z0-9_]+|import\.meta\.env\.[A-Z0-9_]+' --include='*.[jt]s*' src app lib 2>/dev/null | sed 's/.*\.//' | sort -u
grep -RhoE 'os\.environ(\.get)?\(?\[?["'"'"'][A-Z0-9_]+' --include='*.py' . 2>/dev/null | grep -oE '[A-Z0-9_]+$' | sort -u
grep -RhoE 'os\.Getenv\("[A-Z0-9_]+' --include='*.go' . 2>/dev/null | grep -oE '[A-Z0-9_]+$' | sort -u
# What's declared
grep -hoE '^[A-Z0-9_]+' .env.example 2>/dev/null | sort -u
```

Classify each var: **required to boot**, **required for a feature**,
**optional**. Flag ones read but not declared, declared but never read, and
required ones with no safe local default.

**Services: code vs Compose.** List what the code connects to (Postgres,
MySQL, Redis, queues, S3, SMTP, search, Stripe and other third-party APIs) and
what local Compose provides. Anything the app needs that isn't provided
locally, or that points at a shared hosted instance, is a gap.

**Runtimes: pins vs CI.** Versions in version-manager files, `engines`,
Dockerfiles and the CI matrix should agree. Missing pins are a gap.

**Scripts: declared vs working vs documented.** Every script a developer
needs should exist, run, and be in the docs. Broken or stale scripts are gaps.

**Shared state.** Look for default connection strings, docs or scripts that
point at a shared dev/staging database, bucket or API, "ask X for the dump"
instructions, and tests that hit shared environments.

## 3. Walk the fresh-clone path for real

In the worktree, attempt each step the way the docs say to. For each one
record **status** (pass, fail, manual, n/a), the **exact command**, **time
taken**, and the **error or manual step** when it isn't a pass.

| # | Step | What "pass" means |
|---|------|-------------------|
| 1 | Clone | Repo clones; no private submodules or LFS surprises without docs |
| 2 | Prerequisites | Pinned runtimes install via the repo's version manager; system deps documented |
| 3 | Secrets and config | `cp .env.example .env` (or equivalent) is enough to boot; real secrets are only needed for named optional features |
| 4 | Local services | One command brings up every service the app needs, locally |
| 5 | Database | One command resets, migrates and seeds a local DB from scratch |
| 6 | Run | The app starts and answers (HTTP 200, CLI `--help`, worker picks up a job) |
| 7 | Tests | The suite runs from a fresh environment; a single file or test can be run on its own |
| 8 | Lint, typecheck, format | Each has a command and passes (or fails only on pre-existing issues) |
| 9 | Build | Production build succeeds locally |
| 10 | Reset | One command returns the environment to a known state, and steps 4 to 7 pass after it |

Also record, where cheap to check:

- **Machine differences**: amd64-only images on arm64, hard-coded ports that
  clash with common local services, macOS vs Linux shell assumptions.
- **Feedback loop**: time from clone to running app, full test time, whether
  hot reload works.
- **Agent readiness**: see section 6.

If something can't run in this environment (no Docker daemon, no network),
mark it **unverified** with the reason. Never mark it pass.

### Test coverage

Passing tests only matter if they cover the code that matters. Check:

- **A coverage command exists and runs locally** (`vitest --coverage`,
  `jest --coverage`, `pytest --cov`, `go test -cover`, `cargo llvm-cov`).
  Run it and record the overall line/branch figure.
- **CI measures it.** Coverage is collected in CI, and whether a threshold is
  enforced (`coverageThreshold`, `--cov-fail-under`, Codecov status checks).
- **Critical paths are covered.** From the coverage report, list the
  uncovered or barely covered files on paths that matter most: auth,
  payments and billing, data writes and migrations, public API handlers.
  A high overall number with untested billing code is still a gap.
- **Test types are balanced.** Note whether there are unit, integration and
  end-to-end tests, and which of them can run locally.

### Deployment automation

Local readiness includes knowing how code gets from a merged PR to
production, without one person's laptop in the loop. Check:

- **Deploys are automated.** A pipeline deploys on merge to the default branch
  or on a tag (GitHub Actions, Vercel/Netlify/Cloudflare Git integration,
  Render, Fly, Argo, etc.). Find the workflow or platform config and name the
  trigger.
- **No laptop deploys.** Flag READMEs, scripts or Makefile targets that deploy
  from a developer machine (`vercel --prod`, `wrangler deploy`, `fly deploy`,
  `kubectl apply`, `terraform apply`, `scp`) as the documented release path,
  and deploy credentials that only live in someone's local env.
- **Gated on CI.** The deploy runs only after tests pass, not in parallel with
  or instead of them.
- **Migrations are part of the deploy.** Schema migrations run in the pipeline,
  not by hand against production.
- **Previews and rollback.** Whether PRs get preview environments, and whether
  rollback is documented (a redeploy of the previous version, a platform
  rollback command).

Read config and workflow history only. Never trigger a deploy, run a pipeline
against a real environment, or read production secrets as part of this check.

Before any reset, migrate or seed command, confirm the target is local:
`DATABASE_URL` (or equivalent) host must be `localhost`, `127.0.0.1`, a Compose
service name, or a local socket. If it isn't, stop and ask.

## 4. Report the audit

Write the scorecard to `docs/local-development.md` (or the repo's existing
equivalent) under a dated "Readiness" heading. If a previous scorecard exists,
show the delta so repeated runs track progress. Present to the user:

```markdown
## Local readiness: 5/10 → (target)

| # | Step | Status | Evidence |
|---|------|--------|----------|
| 3 | Secrets | fail | `STRIPE_SECRET_KEY` required at boot, no default, not in .env.example |
| 5 | Database | manual | README says "ask for a dump of dev"; no seed script |

## Delivery
| Check | Status | Evidence |
|-------|--------|----------|
| Coverage | 62% lines, not enforced | `src/billing/` 8%, no threshold in CI |
| Deploys | manual | README: "run `vercel --prod` after merging" |

## Gaps
Ranked, each with evidence (file:line, command output) and the proposed fix.

## Proposed changes
Split into **safe** and **structural** (see section 5).
```

In **audit only** mode, stop here.

## 5. Remediate: smallest change, biggest improvement

Prioritise:

1. blockers to running the application
2. shared mutable dependencies
3. missing reproducibility
4. broken or unavailable tests
5. undocumented setup
6. convenience

**Safe changes: apply straight away.**

- Docs: README setup section, `docs/local-development.md`
- `.env.example` with every needed var, safe local defaults, and a comment for
  each real secret saying what it's for and where to get it (1Password,
  Doppler, the provider dashboard). Never commit a real value.
- Runtime pins that match CI
- Fixing a broken script, or adding a missing obvious one (`test:watch`,
  running a single test)
- The AGENTS.md / CLAUDE.md fix in section 6

**Structural changes: ask first, as part of the run.** Show the audit and the
list, then ask which to apply (one multi-select question), then continue.

- adding or changing Compose services
- a seed system, a reset command, or a `doctor` command
- local stand-ins for third-party services
- a new task runner, or changes to how config is loaded
- code changes that make a required var optional

### Command conventions

- Use existing conventions. For JS/TS, `package.json` scripts with the repo's
  package manager. Don't add Make just to alias npm scripts.
- Docker Compose for local infrastructure.
- Make or a `scripts/` CLI only when orchestration spans several independent
  tools and genuinely simplifies the workflow.
- Prefer one obvious entry point (`setup`, `db:reset`, `dev`, `test`), each
  safe to re-run.
- A `doctor` check (runtimes, Docker running, ports free, required vars set,
  each with the fix) earns its place only when setup has more than a few
  prerequisites.

### Database

- Migrations are the source of truth for schema. No schema dumps.
- No shared development database is needed to work locally.
- Seed data is small, deterministic and synthetic: named scenarios that cover
  the real states of the app (an admin, a new user with nothing, a fully
  populated account, an account with failed billing, the empty state). Fixed
  IDs and timestamps so it's reproducible. Reuse test factories where they
  exist.
- Seeds are idempotent. Re-running gives the same state.
- Provide `reset → migrate → seed` as one command, guarded so it refuses to run
  against a non-local host (Node example, adapt to the stack):

```bash
case "$(node -e 'console.log(new URL(process.env.DATABASE_URL).hostname)')" in
  localhost|127.0.0.1|db|postgres) ;;
  *) echo "Refusing to reset a non-local database" >&2; exit 1 ;;
esac
```

- Never use production or customer data, even "anonymised".

### Secrets and third-party services

- The app should boot with only `.env.example` values. A feature that needs a
  real third-party key should be disabled locally, with a clear log line, rather
  than crashing startup.
- Prefer local stand-ins over shared sandboxes: Mailpit for SMTP, MinIO or
  LocalStack for S3 and AWS, stripe-mock or the provider's CLI, the Supabase or
  Firebase local emulators, WireMock or MSW for other HTTP APIs.
- Auth through an external IdP gets a local dev user or bypass that is
  impossible to enable in production.

### Tests

- Tests must run from a fresh environment with only local, deterministic
  dependencies.
- Find tests that need undocumented services, shared environments or missing
  fixtures, and fix the dependency rather than skipping the test.
- Make running a subset easy (one file, one name pattern).
- Never skip, disable or weaken a test to make the walkthrough green. Record a
  pre-existing failure (check it fails on the default branch too) and move on.
- Coverage, **safe**: add a `test:coverage` script and collect coverage in CI.
  **Structural**: enforcing a threshold. Set it just below the current figure
  so it stops regressions without failing today's build.
- Don't write tests for uncovered critical paths in this run. List them,
  ranked, as the recommended next tests.

### Deployment

- Document the existing release path, trigger and rollback in
  `docs/local-development.md` (safe).
- Automating a manual deploy, gating deploys on CI, or moving migrations into
  the pipeline is **structural**: propose the workflow change with the exact
  trigger, but don't add deploy secrets or touch platform settings. Those need
  a human, so list them under "Still manual".

Avoid unnecessary infrastructure or abstraction. If a fix needs more code than
the gap costs, record it as a recommendation instead.

## 6. Agent readiness: AGENTS.md linked from CLAUDE.md

Agents are new joiners on every run, so they need the same commands in a place
they read.

- `AGENTS.md` exists at the repo root and is the single source.
- `CLAUDE.md` links it: either a symlink to `AGENTS.md`, or a file whose content
  includes the import line `@AGENTS.md`. Flag a `CLAUDE.md` that duplicates
  the content instead of linking (they will drift).
- Keep `AGENTS.md` **small**: ideally under 40 lines. It holds only what an
  agent can't cheaply infer: the setup, dev, test (including a single test),
  lint, typecheck and db reset commands, plus a few hard rules. Link to
  `docs/local-development.md` for anything longer. Don't pad it with
  architecture essays or content already in the README.
- If neither file exists, create a minimal `AGENTS.md` and a `CLAUDE.md`
  containing only `@AGENTS.md`. If they exist and are bloated, propose trims
  as a structural change rather than rewriting them unasked.

## 7. Verify from clean

After applying changes, prove them. Tear everything down and repeat section 3
from scratch:

```bash
docker compose down -v          # drop volumes too
git clean -xfd                  # in the worktree only, never the user's checkout
```

Re-run all 10 steps with the new documented commands, exactly as written in the
updated docs. Update the scorecard with the after state. Any step that still
fails is reported with its evidence, not hidden.

Then run the project's own lint, typecheck and unit tests on the branch so the
PR doesn't turn CI red.

## 8. Open one PR

Commit per logical change (env and docs, services, seed and reset, agent
files), push the branch, and open one PR:

```markdown
## Summary
Local readiness 5/10 → 9/10. One line on the biggest change.

## Scorecard
| # | Step | Before | After | Command |
|---|------|--------|-------|---------|

## Delivery
Coverage before/after and whether it's enforced; how deploys are triggered.
Critical paths still lacking tests, ranked.

## Changes
What changed and which gap each one closes.

## Still manual / not fixed
Anything left, why, and what it would take (e.g. a secret only a human can
issue, a structural change the user declined).

## How to try it
The new setup commands, copied from the docs.
```

Never reference Claude or AI in commit messages or the PR body.

## Output

End the run with: the before/after score, the PR link, the single biggest
remaining gap, and the smallest next action to close it.
