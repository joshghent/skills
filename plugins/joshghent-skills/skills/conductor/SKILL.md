---
name: conductor
description: Safely merge all ready open pull requests in reverse chronological order (newest first), one at a time, each verified green by CI, updating and re-checking the rest after every merge — then confirm the CD pipeline actually deploys the apps live and smoke-check them. Detects the repo's merge method and deploy platform (GitHub Actions, Cloudflare Workers/Pages, Vercel, etc.), respects branch protection, and never force-merges or bypasses failing checks. Use when asked to merge all PRs, clear the PR queue, run a merge train, batch-merge and deploy, ship what's ready to production, or make sure CI actually ships the app live.
---

# Conductor: Merge the Queue, Ship It Live

Use this skill to clear a backlog of open pull requests and get the result into
production. It merges every PR that's genuinely ready — in reverse chronological
order, one at a time, each verified green — then confirms the deploy pipeline
actually ships the apps live.

The goal is a **clean, deployed main branch**, not "ran a bunch of merges". A
merge that breaks the build, or a green merge that never reaches production, is
not success.

## Operating principle

Act like a release manager running a merge train. Merge only what's ready,
verify every step, keep `main` green and deployable at all times, and don't
declare done until the code is **live and responding** in production. Never
force a merge past failing checks, never bypass branch protection, and never
merge something marked draft / WIP / do-not-merge. When a PR can't merge
cleanly, skip it and record why — one bad PR must not block or corrupt the rest.

This skill performs **outward-facing, hard-to-reverse actions** (merging to a
shared branch and deploying to production). Present the full plan and get
explicit confirmation before the first merge, unless the user has already told
you to proceed without asking.

## 0. Establish scope and safety first

```bash
gh repo view --json nameWithOwner,defaultBranchRef -q '{repo:.nameWithOwner, base:.defaultBranchRef.name}'
gh auth status                      # confirm you're authed as the right user
```

Confirm before touching anything:

- **Repo and base branch** (usually the default branch — `main`/`master`).
- **Branch protection** on the base: required checks, required approvals, linear
  history, up-to-date-before-merge. Read it and honour it — never work around it.

```bash
gh api repos/{owner}/{repo}/branches/{base}/protection 2>/dev/null \
  -q '{checks:.required_status_checks.contexts, reviews:.required_pull_request_reviews.required_approving_review_count, strict:.required_status_checks.strict}' || echo "no/insufficient protection visibility"
```

- **Merge method** the repo allows/prefers (squash / merge commit / rebase):

```bash
gh repo view --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed
```

Use the repo's configured method. If more than one is allowed, prefer the
project's convention (check recent merged PRs' merge style) — default to squash
for feature branches unless the repo clearly uses merge commits.

## 1. Enumerate the open PRs

Pull every open PR with the signals needed to judge readiness, newest first:

```bash
gh pr list --state open --limit 200 \
  --json number,title,author,createdAt,updatedAt,isDraft,mergeable,mergeStateStatus,reviewDecision,labels,headRefName,baseRefName,statusCheckRollup \
  | jq 'sort_by(.createdAt) | reverse'
```

`mergeStateStatus` is the key signal: `CLEAN` (ready), `BLOCKED` (needs
review/checks), `BEHIND` (needs update against base), `DIRTY` (conflicts),
`UNSTABLE` (non-required checks failing), `DRAFT`.

## 2. Filter to what's actually ready

Include a PR only if **all** hold; otherwise skip it and record the reason:

- **Not a draft**, and no blocking label (`do-not-merge`, `blocked`, `wip`,
  `hold`, `dependencies` if the user excludes bots, etc.).
- **Targets the base branch** in scope (don't merge stacked PRs that target
  other feature branches into main).
- **Required checks passing** (`statusCheckRollup` — every *required* context is
  `SUCCESS`; pending means wait, failure means skip).
- **Approvals satisfied** if branch protection requires them (`reviewDecision`
  is `APPROVED`, not `REVIEW_REQUIRED` or `CHANGES_REQUESTED`).
- **Mergeable** (`mergeable == "MERGEABLE"`; `CONFLICTING` → skip and flag for
  manual conflict resolution).

Never merge to satisfy a count. A PR that needs a human (unresolved review,
conflicts, failing tests) is skipped, not forced.

## 3. Order: reverse chronological (newest first)

Merge in **reverse chronological order by creation date — newest PR first**,
as requested. Be aware of the tradeoff and surface it: merging newest-first
means older PRs are more likely to fall `BEHIND` and need re-updating (and can
develop conflicts) as the branch moves. That's expected — the loop in step 4
re-updates and re-checks each remaining PR after every merge, so it self-heals;
conflicts that can't auto-resolve get skipped. If the user would rather minimise
churn, offer oldest-first as an alternative, but default to what they asked for.

## 4. Merge the train, one at a time

Process PRs sequentially — **never in parallel**, since each merge moves the
base and invalidates the others' up-to-date status. For each ready PR, in order:

1. **Update against base if `BEHIND`** (branch protection `strict` requires it):
   ```bash
   gh pr update-branch <number>        # rebase/merge base into the PR head
   ```
2. **Wait for CI to go green on the updated head.** Poll, don't assume:
   ```bash
   gh pr checks <number> --watch       # blocks until required checks resolve
   ```
   If required checks fail after the update, **skip** this PR (record it) and
   move on — the update surfaced a real integration problem.
3. **Merge with the repo's method**, deleting the head branch:
   ```bash
   gh pr merge <number> --squash --delete-branch   # or --merge / --rebase
   ```
   Do **not** pass `--admin` or otherwise bypass protection. If merge is blocked
   by protection, skip and report what's missing.
4. **Re-evaluate the remaining PRs.** The merge moved the base, so the rest may
   now be `BEHIND`, `DIRTY`, or newly `UNSTABLE`. Re-pull their status before
   the next iteration; a PR that just went `DIRTY` (conflicts) gets skipped with
   a note.

Stop the train and report if the base branch's own post-merge CI goes red at any
point — don't keep stacking merges onto a broken `main`.

## 5. Make sure CI ships the apps live

A merge that never reaches production isn't shipped. After the merges, confirm
the deploy pipeline runs and the apps actually go live.

### Find the deploy pipeline

```bash
ls .github/workflows/ 2>/dev/null                                   # CI/CD workflows
grep -RniE 'deploy|release|publish|wrangler|vercel|pages|fly|render' .github/workflows/ 2>/dev/null
ls wrangler.toml wrangler.jsonc vercel.json fly.toml 2>/dev/null    # platform config
```

Identify the deploy trigger: does a workflow run **on push to the base branch**
(auto-deploy on merge), on a tag/release, or only manually
(`workflow_dispatch`)? Map each app/service in the repo (monorepo: per package)
to its deploy job.

### Watch the deploy and confirm live

```bash
gh run list --branch <base> --limit 10 \
  --json databaseId,name,event,status,conclusion,headSha,createdAt      # find the post-merge deploy run
gh run watch <run-id> --exit-status                                     # block until it finishes; non-zero on failure
gh run view <run-id> --log-failed                                       # if it fails, pull the failing step
```

Then **smoke-check the live app**, don't trust a green pipeline alone:

- Hit the production URL / health endpoint and confirm `200` and, if the app
  exposes one, that the deployed **version/commit** matches the merge SHA.
- Platform-native confirmation where available:
  - **Cloudflare Workers/Pages:** `wrangler deployments list` (latest points at
    the new version); if the Cloudflare MCP is connected, use its Workers tools.
  - **Vercel:** if the Vercel MCP is connected, `list_deployments` /
    `get_deployment` (state `READY`), or `vercel ls`.
- Check runtime errors right after deploy (reuse the observability sources from
  the warden skill — Sentry/New Relic/Workers logs) to catch a deploy that ships
  but immediately throws.

### If CI does not ship live

The user asked to *make sure* CI ships the apps — so treat a missing or broken
deploy as an in-scope problem, not just a note:

- **Deploy job exists but didn't trigger** (e.g. only on tags, or needs manual
  dispatch) → trigger it explicitly (`gh workflow run <deploy>.yml --ref <base>`
  or cut the release/tag the pipeline expects), and confirm it completes.
- **Deploy job failed** → surface the failing step; fix trivial/config causes
  (missing/renamed secret reference, wrong build command, stale action version)
  and re-run. Don't paper over a real app failure to force a green deploy.
- **No deploy pipeline at all** → flag it clearly and **offer to add one** for
  the detected platform (a GitHub Actions workflow that builds and deploys on
  push to the base branch — `wrangler deploy` for Workers, the Pages/Vercel
  build, etc.), matching the project's existing config and secrets. Add it only
  with the user's go-ahead, since it changes how the repo ships.

Never invent or print secret values; deploy uses the repo/environment secrets
already configured. If a required secret is missing, name it and stop.

## Hard rules

- Confirm the plan before the first merge; merging to a shared branch and
  deploying to prod are hard to reverse.
- Merge only genuinely-ready PRs: not draft, mergeable, required checks green,
  approvals satisfied, no do-not-merge signal.
- Reverse chronological order (newest first), sequentially, never in parallel.
- Wait for green after updating each branch; **never** `--admin`, force-merge,
  or bypass branch protection to make a merge go through.
- Skip and record anything that conflicts or fails — one bad PR never blocks or
  corrupts the rest. Stop the train if `main` itself goes red.
- Don't declare done until the deploy pipeline has run and the live app is
  verified (deploy succeeded + smoke check), or the deploy gap is clearly
  flagged.
- Detect the merge method and deploy platform from the repo; don't assume.
- Never reference Claude or AI in merge commits, tags, or workflow changes.

## Output format

```markdown
# Conductor — <repo> → <base>

## Plan (confirm before merging)
PRs to merge, newest first, with readiness. (In dry-run mode this is the whole
output — nothing is merged or deployed.)

| # | PR | Author | Created | State | Decision |
|---|----|--------|---------|-------|----------|
| 1 | #142 title | @a | 2026-07-01 | CLEAN | merge |
| 2 | #139 title | @b | 2026-06-28 | DIRTY | skip — conflicts |

## Merged
| PR | Method | Base CI after merge |
|----|--------|---------------------|
| #142 | squash | green |

## Skipped / blocked
| PR | Reason |
|----|--------|
| #139 | merge conflicts — needs manual rebase |
| #131 | required check `e2e` failing |
| #128 | draft |

## Shipped live
| App / service | Deploy run | Status | Live check |
|---------------|-----------|--------|------------|
| api (Workers) | #4711 | success | 200, version = <sha> ✓ |
| web (Pages)   | #4712 | success | 200 ✓ |

## Deploy gaps (if any)
- What isn't auto-shipping and the fix (e.g. "worker deploys on tag only —
  triggered manually; recommend adding push-to-main trigger").

## Next action
The single most important follow-up (resolve #139's conflicts, add a deploy job, …).
```

## Dry-run / analysis-only mode

If the user asks for a dry run, stop after the **Plan** and **deploy readiness**:
list what *would* merge and in what order, what would be skipped and why, and
whether a merge to base *would* trigger a live deploy — without merging or
deploying anything.
