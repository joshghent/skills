#!/usr/bin/env bash
# A small app whose README names a start command that doesn't exist. Only
# running the documented steps shows the mismatch.
set -euo pipefail
cat > README.md <<'MD'
# Shop

## Getting started

1. `npm install`
2. `npm start`

The app prints "ready" when it's up.
MD
cat > package.json <<'JSON'
{
  "name": "shop",
  "version": "1.0.0",
  "private": true,
  "scripts": { "dev": "node app.js", "test": "node --test" }
}
JSON
echo 'console.log("ready");' > app.js
git init -q -b main
git -c user.name=Shop -c user.email=shop@example.com add -A
git -c user.name=Shop -c user.email=shop@example.com commit -qm "initial"
