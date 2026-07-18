#!/usr/bin/env bash
# Assert ENV issue deliverables exist (local + CI).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fail=0
need() {
  if [ ! -e "$1" ]; then
    echo "MISSING: $1"
    fail=1
  else
    echo "OK: $1"
  fi
}

need .editorconfig
need .gitignore
need LICENSE
need .nvmrc
need .env.example
need package.json
need tsconfig.json
need nest-cli.json
need Dockerfile
need docker-compose.yml
need rules/AST_RULES.yaml
need .github/workflows/ci.yml
need .github/workflows/invariants.yml
need .github/workflows/ast-guards.yml
need docs/db/postgres-index-schema.sql
need contracts/src/representation/ArosCoinView.sol
need contracts/foundry.toml
need rust/Cargo.toml
need rust/crates/nodechain-journal/src/lib.rs
need rust/crates/pot-types/src/lib.rs
need CONTRIBUTING.md
need SECURITY.md
need CHANGELOG.md
need docs/ROADMAP.md
need docs/INTAKE.md
need src/main.ts
need src/app.module.ts
need src/nodechain/nodechain.service.ts

if [ "$fail" -ne 0 ]; then
  echo "check-env-layout FAILED"
  exit 1
fi
echo "check-env-layout: ALL OK"
