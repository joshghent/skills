---
name: repo-warden
description: Automated dependency & security maintenance for a repo — patch Dependabot/advisory alerts (security first), bump outdated deps safely, verify with the project's own build/test, and open one clean, well-summarised PR. Use when asked to patch vulnerabilities, clear Dependabot alerts, update dependencies, or do routine dependency maintenance.
---

# Repo Warden: Dependency & Security Maintenance

Use this skill to do the dependency maintenance people hate — clearing security
alerts and updating outdated packages — and hand back a single, clean,
well-documented pull request rather than a pile of noisy individual bumps.

Distilled from the RepoJanitor/RepoWarden production maintainer. The goal is a
**remediated** repo, not a job that merely "ran": a PR that doesn't push any
real fix is not success.

## Operating principle

Act like a careful maintainer doing a weekly sweep. Security updates first,
then safe version bumps. Every change is verified by the project's own build
and tests before it goes in a PR. Never weaken or bypass tests to make an
upgrade look green. When in doubt, leave a dep alone and say why.

## 0. Set up isolation first

Dependency work mutates lockfiles and node_modules — do it in a worktree, not
the user's working checkout.

```bash
new-worktree <repo-dir> deps/security-sweep origin/main   # origin/master if that's the default
```

If `new-worktree` isn't available: `git worktree add`, link/copy `.env*`, then
install deps with the detected package manager (below).

## 1. Detect the stack — never guess

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

## 2. Gather the work — security first

Prioritise in this order: **(1) known vulnerabilities → (2) outdated deps**.

GitHub Dependabot alerts and advisories (preferred signal — they carry severity
and the affected range):

```bash
gh api repos/{owner}/{repo}/dependabot/alerts --paginate \
  -q '.[] | select(.state=="open") | {pkg:.dependency.package.name, sev:.security_advisory.severity, range:.security_vulnerability.vulnerable_version_range, fixed:.security_vulnerability.first_patched_version.identifier, manifest:.dependency.manifest_path}'
```

Also fold in the package manager's own audit output and `outdated` listing
(`npm outdated`, `pnpm outdated`, etc.) for non-security bumps.

### Critical gotcha — deriving the fix version

GHSA's `first_patched_version` is **often empty**. Do not drop a vuln just
because it's null. Derive the target from the **affected range's exclusive `<`
upper bound** instead — e.g. range `< 4.17.21` ⇒ upgrade to `4.17.21`. A fix
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

## 3. Plan the changes safely

- **Group sensibly.** One PR for the sweep, but batch by risk: security patches
  and patch/minor bumps together; isolate any major-version bump (likely
  breaking) into its own clearly-labelled commit, or skip and flag it.
- **Respect failure memory.** If a previous attempt to upgrade `X` to version
  `V` already failed (a prior PR/commit/comment says so), don't blindly retry it
  in the same sweep — note it as blocked and move on. (RepoJanitor calls this
  rollback memory with an exponential cooldown.)
- **Don't fight the pins.** If `.mise.toml`/engines or a peer-dep constraint
  blocks an upgrade, respect it and report it rather than forcing it.

## 4. Apply and verify — every change

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

## 5. Open one clean PR

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

## Risk summary
- What could break and why (e.g. major bumps, behaviour changes), and what was
  verified (build ✓, tests ✓, audit clean ✓).

## Skipped / blocked
- Package, attempted version, reason (breaks tests / peer-dep conflict / prior
  failure cooldown). So the next run knows not to retry blindly.
```

Never reference Claude or AI in the commit messages or PR body.

## Output when not opening a PR

If the user only wants analysis (not a PR), produce the same three tables —
**Security fixes**, **Dependency updates**, **Skipped/blocked** — plus a short
risk summary and the exact commands to apply them.

## Hard rules

- Security before cosmetics; a no-op "fix" is a failure.
- Detect the package manager from the lockfile; use only that one.
- Verify with the project's own build/tests; never fake green.
- Isolate major bumps; don't bundle breaking changes silently.
- Prefer lockfile-only overrides/resolutions for transitive vulns.
- Record what you skipped and why.
