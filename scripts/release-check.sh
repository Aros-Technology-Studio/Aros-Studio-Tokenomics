#!/usr/bin/env bash
# Pre-release verification for AST real build
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Core tests"
npm test

echo "==> Portal shared tests"
npm --prefix portal/shared test

echo "==> Portal backend tests"
AST_ALLOW_DEMO=1 NODE_ENV=test npm --prefix portal/backend test

echo "==> Portal backend build"
npm --prefix portal/backend run build

echo "==> Portal frontend build"
npm --prefix portal/frontend run build

echo "==> Core production build"
npm run build

echo "==> Release check OK"
