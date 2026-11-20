---
"joshghent-skills": patch
---

Fix skills never loading their instructions. Each `commands/<name>.md` shared its skill's name, so the Skill tool loaded the one-line command and the agent never read `SKILL.md`. The commands are gone; each skill is still the `/<name>` slash command, with its argument hint moved into the skill.
