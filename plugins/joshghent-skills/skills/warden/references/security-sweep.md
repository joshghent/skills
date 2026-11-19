# Warden: initial security PR

### 8.1 Ask for scope first

Before touching anything, ask which repos to cover: **the current repo**, **a
list of repos**, or **a whole org**. For an org, get counts per repo from the
org-level endpoints and show them so the user can pick:

```bash
{ gh api -X GET orgs/{org}/dependabot/alerts --paginate -f state=open -f severity=critical,high
  gh api -X GET orgs/{org}/code-scanning/alerts --paginate -f state=open -f severity=critical,high
  gh api -X GET orgs/{org}/secret-scanning/alerts --paginate -f state=open
} | jq -r '.[].repository.full_name' | sort | uniq -c | sort -rn
```

Skip archived repos and forks. Run repos one at a time, each in its own
worktree or clone. A failure in one repo is recorded and the run moves on.

### 8.2 Collect (read-only, paginated)

Per repo, default branch only:

```bash
gh api -X GET repos/{o}/{r}/dependabot/alerts --paginate -f state=open -f severity=critical,high
gh api -X GET repos/{o}/{r}/code-scanning/alerts --paginate -f state=open -f severity=critical,high
gh api -X GET repos/{o}/{r}/secret-scanning/alerts --paginate -f state=open
```

- Code scanning: confirm `rule.security_severity_level` is `high` or `critical`.
  The plain `rule.severity` only says error, warning or note.
- Secret scanning has no severity. Treat every open alert as critical. Never
  print the `secret` field.
- A 403 or 404 means the feature is off or the token lacks `security_events`.
  Name the missing source in the summary and carry on with the others.
- Zero alerts across all sources: report that and stop. No empty PR.

### 8.3 Group and classify

Reduce each alert to: source, id, severity, package or rule, location, fix
version, URL. Group Dependabot alerts by package and manifest, since one bump
closes several. Use the highest fix version in the group, deriving it from the
affected range when `first_patched_version` is empty (see the gotcha above).

Every group gets exactly one outcome:

- **Fix.** A patched version or a clear code change exists, and build and tests
  pass.
- **Triage.** No patch exists, the fix breaks the build, the package is dev-only
  or unreachable, or a code fix needs a design call. Give a one-line reason.
- **Escalate.** Every secret. A PR can't fix a leaked credential. It needs
  rotation by a human.

### 8.4 Apply

- One commit per fix group, so a failing one reverts alone.
- Dependency fixes follow sections 3 to 6 (overrides bounded to the same major,
  no blanket updates). They need no new test. The existing suite and a re-run of
  the audit are the check.
- Code scanning fixes edit app code, one commit per alert. For each:
  1. Search for existing tests that cover the flagged file or function.
  2. If a test already exercises the vulnerable path, run it. Add a failing case
     only when the vulnerable behaviour isn't asserted.
  3. If no test exists, write the smallest failing test, confirm it fails for the
     right reason, then make the fix and confirm green.
  4. If the path can't be tested, say why in the PR and skip the test.
  Match the project's test framework. If the fix needs a design decision, make
  it a Triage item and leave the code alone.

### 8.5 Open the PR

If a `deps/security-initial` branch or open PR already exists, update it rather
than opening a second one. Label the PR `security-sweep` (conductor keys off
this). Keep the body short enough to scan in under a minute:

```markdown
Fixes 5, triages 2, escalates 1 of 8 high/critical alerts.

### Needs a human
- Secret: AWS key in `config/old.ts` ([alert](url)). Rotate it, then close the alert.

### Fixed
| Alert | Package / rule | Sev | Change |
|-------|----------------|-----|--------|

### Triaged (not fixed)
| Alert | Why | Suggested dismissal |
|-------|-----|---------------------|

### Blocked
| Alert | Error |
|-------|-------|

Verified: build, tests, audit. Nothing was dismissed.
```

Rules for the body:
- Omit any section that is empty.
- Suggested dismissal uses GitHub's reasons: `not_used`, `tolerable_risk`,
  `no_bandwidth`, `inaccurate`, `fix_started`.
- **Do not dismiss alerts through the API.** Dismissal changes state other people
  see. Only do it after the user approves a specific batch.
- Alerts close when GitHub rescans the default branch after merge, not locally.
  Say so, and re-run the local audit to confirm the packages are patched.

End the run with a **Next action** line listing each PR URL and, if the user
wants them merged, "run conductor on these repos". Warden never merges.

