#!/usr/bin/env bash
# A small app whose README and scripts agree, but whose config file has a
# trailing comma. It looks fine on a skim and crashes the moment it runs.
set -euo pipefail
mkdir -p config
cat > README.md <<'MD'
# Shop

## Getting started

1. `npm install`
2. `npm start`

The app prints "ready on port 3000" when it's up.
MD
cat > package.json <<'JSON'
{
  "name": "shop",
  "version": "1.0.0",
  "private": true,
  "scripts": { "start": "node app.js", "test": "node --test" }
}
JSON
cat > config/default.json <<'JSON'
{
  "port": 3000,
  "currency": "GBP",
}
JSON
cat > app.js <<'JS'
const config = require("./config/default.json");
console.log(`ready on port ${config.port}`);
JS
git init -q -b main
git -c user.name=Shop -c user.email=shop@example.com add -A
git -c user.name=Shop -c user.email=shop@example.com commit -qm "initial"
