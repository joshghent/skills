---
"joshghent-skills": patch
---

groundwork now measures CI time from recent runs, finds where the time goes (missing caches, repeated setup, serial jobs, unsharded tests, no path filters, no cancel-in-progress), and applies the safe speed-ups. Closes #22.
