# Changesets

Run `npx changeset` in any PR that changes a skill. Pick `patch` for fixes and
wording, `minor` for a new skill or new behaviour, `major` for a removed or
renamed skill. On merge to `main`, CI opens a "version skills" PR that bumps
the plugin version and writes `CHANGELOG.md`. Merging that PR tags the release.
