#!/usr/bin/env bash
# A Node project whose only dependency has a v2 sitting in vendor/. v2 renames
# the export, so bumping without touching the code breaks the test.
set -euo pipefail
mkdir -p vendor/greeting-1 vendor/greeting-2 node_modules src test

cat > vendor/greeting-1/package.json <<'JSON'
{ "name": "greeting", "version": "1.0.0", "main": "index.js" }
JSON
echo 'exports.greet = (name) => `Hello, ${name}`;' > vendor/greeting-1/index.js

cat > vendor/greeting-2/package.json <<'JSON'
{ "name": "greeting", "version": "2.0.0", "main": "index.js" }
JSON
echo 'exports.sayHello = (name) => `Hello, ${name}`;' > vendor/greeting-2/index.js

cp -R vendor/greeting-1 node_modules/greeting

cat > package.json <<'JSON'
{
  "name": "shop",
  "version": "1.0.0",
  "private": true,
  "scripts": { "test": "node --test" },
  "dependencies": { "greeting": "file:vendor/greeting-1" }
}
JSON
cat > src/welcome.js <<'JS'
const { greet } = require("greeting");
exports.welcome = (user) => greet(user.name);
JS
cat > test/welcome.test.js <<'JS'
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { welcome } = require("../src/welcome");
test("welcomes the user by name", () => assert.equal(welcome({ name: "Ada" }), "Hello, Ada"));
JS
echo node_modules > .gitignore

git init -q -b main
git -c user.name=Shop -c user.email=shop@example.com add -A
git -c user.name=Shop -c user.email=shop@example.com commit -qm "initial"
