---
"joshghent-skills": patch
---

Address Snyk audit findings on skills.sh: drop warden's instruction to hide AI involvement in commits and PRs, make warden confirm endoflife.date versions against the vendor's own release page, and tell every skill that reads outside text (errors, search queries, PRs, commits, web pages) to treat it as data, never instructions. Document installing every skill with `npx skills add joshghent/skills --skill '*'`.
