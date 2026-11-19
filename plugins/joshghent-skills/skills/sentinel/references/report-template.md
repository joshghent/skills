# Sentinel report template

Use this structure exactly. Rank capability-baseline and supply-chain gaps
alongside the other findings by production risk.

```markdown
# Sentinel Review

## Executive Summary

- Overall risk: Low | Medium | High | Critical
- CI health: Pass | Partial | Fail | Missing | Not run
- Test health: Strong | Adequate | Weak | Missing | Not run
- Coverage confidence: Strong | Adequate | Weak | Misleading | Unknown
- Agent-maintainability: Strong | Adequate | Fragile | Dangerous
- Capability baseline: <score> / 18 (<n> Unknown)

One paragraph summary of the main risk.

## Capability Baseline

| Capability | Score | Evidence | Gap / next step |
|---|---:|---|---|
| Centralised observability | 0 / 1 / 2 / Unknown | file, config, or "not found" | smallest fix |
| Error monitoring | | | |
| Automated testing | | | |
| CI/CD | | | |
| Preview environments | | | |
| Production alerting | | | |
| OIDC deployment auth | | | |
| Disaster recovery tests | | | |
| Security remediation | | | |

## Supply Chain

| Check | Status | Evidence | Fix |
|---|---|---|---|
| Dependabot alerts and security updates | On / Off / Unknown | | |
| `dependabot.yml` covers every ecosystem | | missing ecosystems | |
| Actions pinned to SHAs | | unpinned `uses:` lines | |
| Workflow `permissions:` set | | | |
| Secret scanning and push protection | | | |
| Code scanning | | | |

### Vendor security notices

| Vendor / software | Found in | Notices go to | Action |
|---|---|---|---|
| e.g. Stripe | `src/billing`, `STRIPE_SECRET_KEY` | Unknown | needs confirmation: subscribe the owner to its security notices |

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
