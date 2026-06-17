---
name: warden
description: Automated dependency and security maintenance for a repo. Patches Dependabot/advisory alerts (security first), bumps outdated deps safely, upgrades end-of-life runtimes to the current LTS using endoflife.date, verifies with the project's own build and tests, and opens one clean, well-summarised PR. Use when asked to patch vulnerabilities, clear Dependabot alerts, update dependencies, upgrade an end-of-life runtime, or do routine dependency maintenance.
---

# Warden: Dependency and Security Maintenance

Use this skill for the dependency maintenance people hate: clearing security
alerts, retiring end-of-life runtimes, and updating outdated packages, handed
back as a single clean pull request rather than a pile of noisy individual bumps.

The goal is a **remediated** repo, not a job that merely "ran". A PR that
doesn't push any real fix is not success.

## Operating principle

Act like a careful maintainer doing a weekly sweep. Security updates first,
then end-of-life runtimes, then safe version bumps. Every change is verified by
the project's own build and tests before it goes in a PR. Never weaken or bypass
tests to make an upgrade look green. When in doubt, leave a dep alone and say why.

## 0. Set up isolation first

Dependency work mutates lockfiles and node_modules, so do it in a worktree, not
the user's working checkout.

```bash
new-worktree <repo-dir> deps/security-sweep origin/main   # origin/master if that's the default
```

If `new-worktree` isn't available: `git worktree add`, link/copy `.env*`, then
install deps with the detected package manager (below).

## 1. Detect the stack, never guess

```bash
git -C <repo> rev-parse --show-toplevel
ls package-lock.json pnpm-lock.yaml yarn.lock bun.lockb 2>/dev/null   # JS manager
ls Cargo.toml go.mod requirements.txt pyproject.toml *.csproj 2>/dev/null
cat .mise.toml mise.toml .tool-versions 2>/dev/null                   # pinned runtimes
```

Package manager, by lockfile (use this one only):

| Lockfile            | Manager | Install                  | Audit                  |
|---------------------|---------|--------------------------|------------------------|
| `pnpm-lock.yaml`    | pnpm    | `pnpm install`           | `pnpm audit`           |
| `yarn.lock`         | yarn    | `yarn install`           | `yarn npm audit`       |
| `package-lock.json` | npm     | `npm ci` / `npm install` | `npm audit`            |
| `bun.lockb`         | bun     | `bun install`            | `bun audit`            |

Other ecosystems: cargo (`cargo update`, `cargo audit`), Go
(`go get -u`, `govulncheck`), Python (`pip-audit`, poetry/uv per lockfile),
NuGet (`dotnet list package --vulnerable`). If `.mise.toml`/`.tool-versions`
pins runtimes, run everything through `mise exec --` so versions match CI.

In a monorepo/workspace, resolve dependencies per workspace package, not just at
the root.

## 2. Gather the work, security first

Prioritise in this order: **(1) known vulnerabilities → (2) end-of-life runtimes → (3) outdated deps**.

GitHub Dependabot alerts and advisories (the preferred signal, since they carry
severity and the affected range):

```bash
gh api repos/{owner}/{repo}/dependabot/alerts --paginate \
  -q '.[] | select(.state=="open") | {pkg:.dependency.package.name, sev:.security_advisory.severity, range:.security_vulnerability.vulnerable_version_range, fixed:.security_vulnerability.first_patched_version.identifier, manifest:.dependency.manifest_path}'
```

Also fold in the package manager's own audit output and `outdated` listing
(`npm outdated`, `pnpm outdated`, etc.) for non-security bumps.

### Critical gotcha: deriving the fix version

GHSA's `first_patched_version` is **often empty**. Do not drop a vuln just
because it's null. Derive the target from the **affected range's exclusive `<`
upper bound** instead. For example, range `< 4.17.21` means upgrade to `4.17.21`. A fix
that reads only `first_patched_version` silently no-ops and the vuln survives.

### Transitive vs direct

- **Direct dependency** vulnerable → bump it in the manifest.
- **Transitive dependency** vulnerable (the Dependabot-alert common case) →
  prefer a **lockfile-only** fix via the manager's override mechanism rather
  than touching application code:
  - npm: `overrides` in package.json
  - pnpm: `pnpm.overrides`
  - yarn: `resolutions`
  Pin the transitive package to the fixed version, re-resolve the lockfile, and
  keep the change minimal (ideally lockfile + an overrides stanza only).

### Authoring overrides safely

Overrides are the most common cause of a "fix" that breaks the build. Apply
these rules to every one you write:

- **Stay within the same major version.** Bound the output so it can't cross a
  major boundary. Correct: `"brace-expansion@<1.1.13": ">=1.1.13 <2.0.0"`.
  Wrong: `"brace-expansion": ">=1.1.13"` (can resolve to v2+ on v1 consumers).
  `pnpm audit --fix` frequently emits unbounded ranges that cross majors, so
  review and bound every override it generates.
- **Pin frameworks exactly, range libraries.** Frameworks (Next.js, React,
  Angular, etc.) ship behaviour changes in patch releases, so pin to the exact
  patched version (`"next@>=14.0.0 <14.2.25": "14.2.25"`). Libraries can take a
  bounded range (`"handlebars@>=4.0.0 <=4.7.8": ">=4.7.9 <5.0.0"`).
- **Don't bump a direct dep to pull in a transitive fix.** That drags in
  unrelated feature/behaviour/API changes from the direct dep's new version.
  Fix the transitive package directly through the override instead.
- **Never run blanket updates.** No bare `pnpm update` / `yarn upgrade` /
  `npm update` (they bump everything indiscriminately); target the specific
  package only. yarn v1 resolutions use `"**/package": "version"` syntax.

## 3. Upgrade end-of-life runtimes and software

An end-of-life (EoL) runtime stops receiving security patches, so a repo pinned
to one is a standing vulnerability even when every package is current. Treat EoL
upgrades as part of the sweep, but as **isolated, higher-risk changes** (their
own commit, often their own PR) because they break in ways a lockfile bump does
not.

### Find what's pinned

Runtimes and platform software are pinned in more than one place. Find every one
so the bump stays consistent:

```bash
cat .mise.toml mise.toml .tool-versions .nvmrc .python-version 2>/dev/null   # version managers
grep -n '"engines"' package.json 2>/dev/null                                 # node/npm engines
grep -RniE 'FROM .*(node|python|ruby|php|golang|postgres|redis)' Dockerfile* 2>/dev/null
grep -RnE '(node-version|python-version|go-version)' .github/workflows 2>/dev/null  # CI matrix
grep '^go ' go.mod 2>/dev/null                                               # Go directive
```

### Check lifecycle against endoflife.date

endoflife.date publishes a free JSON API. Query the product to see which cycles
are still supported and which are EoL. The product slug is the lowercase name
(`nodejs`, `python`, `php`, `ruby`, `go`, `postgresql`, `redis`, `ubuntu`, ...).

```bash
curl -fsSL https://endoflife.date/api/nodejs.json \
  | jq -r '.[] | "\(.cycle)\tlts=\(.lts)\teol=\(.eol)\tlatest=\(.latest)"'
```

Read the fields per cycle:

- `eol`: `false` (still supported), `true`, or a date. A date in the past means
  that cycle is EoL now; a near-future date means it is about to be.
- `lts`: `false` (not an LTS line) or the date it entered LTS.
- `latest`: the newest released version on that cycle.

### Pick the target and bump

- **Target the newest cycle that is in LTS** (`lts` is a date, not `false`) and
  whose `eol` is still in the future. For Node that is the latest even-numbered
  line (e.g. 20 → 24); do not jump to a "current"/odd line that isn't LTS.
- Bump the version to that cycle's `latest` in **every** place you found it
  pinned: version-manager files, `engines`, the Dockerfile base image, and the
  CI matrix. A bump that updates `.nvmrc` but not the Dockerfile is not done.
- If the EoL thing is software rather than a runtime (an EoL major of a
  framework, database, etc.), the same applies: check its endoflife.date entry
  and move to a supported major, isolated as its own change.

### Verify on the new runtime

The bump only counts if the project actually works on it. Switch the local
toolchain to the target and run the real checks:

```bash
mise install                 # or: nvm install 24 && nvm use 24
<pm> install                 # re-resolve against the new runtime
<pm> run build               # if a build script exists
<pm> test                    # the project's own unit tests
```

Then confirm the app **runs**, not just that it compiles: start the server,
invoke the CLI, or run whatever smoke check the repo provides. If the build,
tests, or app fail on the new runtime, do not ship the bump. Record it as
blocked with the error and leave the runtime on its current cycle if that cycle
is still supported.

## 4. Plan the changes safely

- **Group sensibly.** One PR for the sweep, but batch by risk: security patches
  and patch/minor bumps together; isolate any major-version bump (likely
  breaking) into its own clearly-labelled commit, or skip and flag it.
- **Respect failure memory.** If a previous attempt to upgrade `X` to version
  `V` already failed (a prior PR/commit/comment says so), don't blindly retry it
  in the same sweep. Note it as blocked and move on (rollback memory with a
  cooldown so the next run doesn't retry it blindly).
- **Don't fight the pins.** If `.mise.toml`/engines or a peer-dep constraint
  blocks an upgrade, respect it and report it rather than forcing it.

## 5. Apply and verify every change

For each batch:

```bash
<pm> install                 # re-resolve lockfile
<pm> run build   || true     # if a build script exists
<pm> test                    # the project's own tests
<pm> run typecheck || true   # and lint, if present
```

Rules:
- A change ships only if install + build + tests pass. If a bump breaks the
  build/tests, **revert that single dep**, record it as blocked, and continue
  with the rest. One bad dep must not sink the whole PR.
- Never edit tests, add `--force`/`--legacy-peer-deps`, or loosen config just to
  make an upgrade pass. That's a false green.
- Re-run the security audit at the end to confirm the alerts you targeted are
  actually gone.
- For an override-only security fix, `git diff --stat` should show only
  `package.json` (the overrides/resolutions stanza) and the lockfile. If any
  other file changed, something went wrong. Revert it and investigate.
- Run the project's **unit** tests, not its e2e/integration/browser suites
  (those depend on deployed infra and aren't a fair local pre-merge check). If a
  test fails, confirm it isn't already failing on the base branch before blaming
  your change.

## 6. Open one clean PR

Commit per logical batch, push the branch, and open a PR with `gh pr create`.
Use a precise title and a description with these sections:

```markdown
## Summary
One line: what this sweep does (e.g. "Patch 3 security alerts + 6 routine bumps").

## Security fixes
| Package | Severity | From → To | Alert | Direct/Transitive |
|---------|----------|-----------|-------|-------------------|
| lodash  | high     | 4.17.20 → 4.17.21 | GHSA-… | transitive (override) |

## Dependency updates
| Package | From → To | Type (patch/minor/major) |
|---------|-----------|--------------------------|

## Runtime & EoL upgrades
| Runtime/Software | From → To | Supported until (endoflife.date) |
|------------------|-----------|----------------------------------|
| node | 20 → 24 | 2028-04 |

## Risk summary
- What could break and why (e.g. major bumps, behaviour changes), and what was
  verified (build ✓, tests ✓, audit clean ✓).

## Skipped / blocked
- Package, attempted version, reason (breaks tests / peer-dep conflict / prior
  failure cooldown). So the next run knows not to retry blindly.
```

Never reference Claude or AI in the commit messages or PR body.

## Output when not opening a PR

If the user only wants analysis (not a PR), produce the same three tables
(**Security fixes**, **Dependency updates**, **Skipped/blocked**) plus a short
risk summary and the exact commands to apply them.

## Hard rules

- Security before cosmetics; a no-op "fix" is a failure.
- Detect the package manager from the lockfile; use only that one.
- Verify with the project's own build/tests; never fake green.
- Isolate major bumps and runtime upgrades; don't bundle breaking changes silently.
- Prefer lockfile-only overrides/resolutions for transitive vulns; bound every
  override to the same major version and pin frameworks to the exact patch.
- Upgrade end-of-life runtimes to the current LTS (check endoflife.date) and
  verify the app runs and tests pass on it before shipping.
- Record what you skipped and why.
