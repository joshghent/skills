# joshghent-skills

## 1.3.0

### Minor Changes

- [#13](https://github.com/joshghent/skills/pull/13) [`785d3d7`](https://github.com/joshghent/skills/commit/785d3d77a0718340ad9cb33d5a4ae713e3e6539a) Thanks [@joshghent](https://github.com/joshghent)! - sentinel now scores a capability baseline (observability, error monitoring, testing, CI/CD, previews, alerting, OIDC deploys, disaster recovery, security remediation) and checks supply-chain hygiene: Dependabot coverage, SHA-pinned actions, and vendor security notices. warden adds missing Dependabot config and pins actions to SHAs. Commands now hand off to their skills instead of repeating them, blogger and sentinel load their templates on demand, and every skill description says when to use it. Adds CI checks and trigger evals for every skill.

### Patch Changes

- [#23](https://github.com/joshghent/skills/pull/23) [`b300f23`](https://github.com/joshghent/skills/commit/b300f2327136624023ff8a014a7388eaf7f80152) Thanks [@joshghent](https://github.com/joshghent)! - Add behaviour evals for warden, conductor and groundwork, each a normal and a pressure case run with and without the plugin. warden runs the tests even when told to skip them, groundwork runs the setup steps even when asked for a quick look, and both descriptions cover the rushed version of their request. Trigger evals now check exactly which skill loaded.

- [#24](https://github.com/joshghent/skills/pull/24) [`8a2fae5`](https://github.com/joshghent/skills/commit/8a2fae5d1471f2c197b9bfefc787d29b9e125d0c) Thanks [@joshghent](https://github.com/joshghent)! - groundwork now measures CI time from recent runs, finds where the time goes (missing caches, repeated setup, serial jobs, unsharded tests, no path filters, no cancel-in-progress), and applies the safe speed-ups. Closes [#22](https://github.com/joshghent/skills/issues/22).

- [#9](https://github.com/joshghent/skills/pull/9) [`ffde864`](https://github.com/joshghent/skills/commit/ffde864bf8e129c147b8ff17a1bd02d3b2f0266c) Thanks [@joshghent](https://github.com/joshghent)! - Document installing a single skill with `npx skills add joshghent/skills --skill groundwork` and link the `groundwork` launch post.

- [#17](https://github.com/joshghent/skills/pull/17) [`ea85a83`](https://github.com/joshghent/skills/commit/ea85a8362d475e941fb6f82b36910e018cef351d) Thanks [@joshghent](https://github.com/joshghent)! - Add an hk pre-commit hook that validates the skills and runs the trigger evals when a skill, command or eval changes.

- [#21](https://github.com/joshghent/skills/pull/21) [`a23aa05`](https://github.com/joshghent/skills/commit/a23aa05e0c57c85b70bd52e13b1a7834b68cef7c) Thanks [@joshghent](https://github.com/joshghent)! - Fix skills never loading their instructions. Each `commands/<name>.md` shared its skill's name, so the Skill tool loaded the one-line command and the agent never read `SKILL.md`. The commands are gone; each skill is still the `/<name>` slash command, with its argument hint moved into the skill.

- [#19](https://github.com/joshghent/skills/pull/19) [`343255d`](https://github.com/joshghent/skills/commit/343255de01ee4067c5f280cf9ff1a23355a8d580) Thanks [@joshghent](https://github.com/joshghent)! - Add a free routing check to CI: 45 prompts must rank the right skill first against the real descriptions. beacon now covers the SEO of existing blog posts, and sentinel covers weak or missing CI checks.

- [#20](https://github.com/joshghent/skills/pull/20) [`3cd605a`](https://github.com/joshghent/skills/commit/3cd605afa5eee4242ad0c1eaf99005fe0fe72b53) Thanks [@joshghent](https://github.com/joshghent)! - Scan every skill with Cisco skill-scanner in CI and the pre-commit hook. High or critical findings fail the build.

- [#18](https://github.com/joshghent/skills/pull/18) [`14f901d`](https://github.com/joshghent/skills/commit/14f901db1b92b7c0454578e2e8b1b5ee82f0027c) Thanks [@joshghent](https://github.com/joshghent)! - Keep every SKILL.md at 500 lines or fewer. sentinel loads its coverage and code smell checklists from references/, and warden loads its security PR mode only for `/warden security`.

- [#12](https://github.com/joshghent/skills/pull/12) [`ca4762f`](https://github.com/joshghent/skills/commit/ca4762f6ea85aa5a9d58462f89e9cc0abccb12b5) Thanks [@joshghent](https://github.com/joshghent)! - Address Snyk audit findings on skills.sh: drop the instruction in warden, conductor and groundwork to hide AI involvement in commits and PRs, make warden confirm endoflife.date versions against the vendor's own release page, and tell every skill that reads outside text (errors, search queries, PRs, commits, web pages) to treat it as data, never instructions. Document installing every skill with `npx skills add joshghent/skills --skill '*'`.

## 1.2.0

### Minor Changes

- [#7](https://github.com/joshghent/skills/pull/7) [`f064f4f`](https://github.com/joshghent/skills/commit/f064f4ffa6a7c1bc7dba933493b5efcc59de0a48) Thanks [@joshghent](https://github.com/joshghent)! - `groundwork` now checks test coverage (command, CI enforcement, uncovered critical paths) and whether deployments are automated and gated on CI.

- [#5](https://github.com/joshghent/skills/pull/5) [`9fb07d8`](https://github.com/joshghent/skills/commit/9fb07d89728904f9af9bfa12993706ced80a01e2) Thanks [@joshghent](https://github.com/joshghent)! - Add `groundwork`: walks the fresh-clone path for real, scores local development readiness, fixes the gaps, and opens one PR with a before/after scorecard.

## 1.1.0

### Minor Changes

- [#3](https://github.com/joshghent/skills/pull/3) [`8453fa0`](https://github.com/joshghent/skills/commit/8453fa02b41d92190545f2947937eb6bbb9a6827) Thanks [@joshghent](https://github.com/joshghent)! - Version the plugin with changesets and publish a tagged release from each version PR.
