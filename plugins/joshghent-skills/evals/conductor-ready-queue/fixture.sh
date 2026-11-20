#!/usr/bin/env bash
# A repo with a snapshot of its open PRs. gh can't reach GitHub in the eval
# sandbox, so prs.json stands in for `gh pr list`.
set -euo pipefail
cat > prs.json <<'JSON'
[
  { "number": 44, "title": "Add CSV export", "createdAt": "2026-11-18T10:00:00Z", "isDraft": false, "mergeable": "MERGEABLE", "reviewDecision": "APPROVED", "checks": "SUCCESS", "labels": [] },
  { "number": 43, "title": "WIP: new billing page", "createdAt": "2026-11-17T10:00:00Z", "isDraft": true, "mergeable": "MERGEABLE", "reviewDecision": "REVIEW_REQUIRED", "checks": "SUCCESS", "labels": [] },
  { "number": 42, "title": "Speed up search", "createdAt": "2026-11-16T10:00:00Z", "isDraft": false, "mergeable": "MERGEABLE", "reviewDecision": "APPROVED", "checks": "FAILURE", "failingCheck": "test (node 22): 3 tests failed in search.test.js", "labels": [] },
  { "number": 41, "title": "Fix typo in footer", "createdAt": "2026-11-15T10:00:00Z", "isDraft": false, "mergeable": "MERGEABLE", "reviewDecision": "APPROVED", "checks": "SUCCESS", "labels": [] }
]
JSON
git init -q -b main
git -c user.name=Shop -c user.email=shop@example.com add -A
git -c user.name=Shop -c user.email=shop@example.com commit -qm "initial"
