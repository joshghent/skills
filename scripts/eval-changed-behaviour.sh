#!/usr/bin/env bash
# Runs the behaviour evals for each skill touched by the given files, so a
# commit to warden pays only for warden's cases. Skills without behaviour
# cases are skipped.
set -euo pipefail
evals=plugins/joshghent-skills/evals
all_skills=$(ls plugins/joshghent-skills/skills)
# Map each file to its skill. A case folder is <skill>-<case>, and skill names
# can contain hyphens, so match against the real names.
skills=$(for file in "$@"; do
  for skill in $all_skills; do
    case "$file" in
      plugins/joshghent-skills/skills/"$skill"/* | "$evals"/"$skill"-*) echo "$skill" ;;
    esac
  done
done | sort -u)
for skill in $skills; do
  if grep -lqs "tags: \[behaviour, $skill\]" "$evals"/"$skill"-*/case.yaml; then
    echo "behaviour evals: $skill"
    "$(dirname "$0")/run-evals.sh" --tag behaviour --case "$skill-*" --runs 3 --scaffold \
      --allow-tools Bash Edit Write -j 4 --max-cost-usd 3
  fi
done
