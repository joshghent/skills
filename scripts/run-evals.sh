#!/usr/bin/env bash
# Runs `claude plugin eval` on the plugin with the given extra arguments.
# Eval runs get a temporary HOME, so mise shims can't find their config and
# `node`/`npm` fail inside them. Put the real Node directory first on PATH.
set -euo pipefail
node_dir=$(node -p 'require("path").dirname(process.execPath)')
export PATH="$node_dir:$PATH"
exec claude plugin eval plugins/joshghent-skills --no-publish --trust-plugin "$@"
