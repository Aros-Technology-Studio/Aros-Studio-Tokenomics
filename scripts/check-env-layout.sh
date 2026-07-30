#!/usr/bin/env bash
# Assert ENV / layers foundation deliverables exist (local + CI).
# Portal is optional edge — not required by this gate.
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
need .github/workflows/layout-scaffold-guard.yml
need .github/workflows/component-docs-guard.yml
need .github/scripts/run-all-guards.sh
need .github/scripts/layout-scaffold-guard.sh
need .github/scripts/component-docs-guard.sh
need docs/db/postgres-index-schema.sql
need docs/layers/README.md
need docs/AST-CORE-CANON.md
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
need src/orchestrator/orchestrator.service.ts
need src/pot/pot.service.ts

# Explicit non-requirement: portal edge may exist but is not ENV layout-required.
if [ -d portal ]; then
  echo "NOTE: portal/ present (optional edge; not required by check:env)"
fi

# A7: local chat/agent dumps must stay out of git
if ! grep -qE '^sessions/' .gitignore 2>/dev/null; then
  echo "MISSING: .gitignore must list sessions/ (do not commit agent chat dumps)"
  fail=1
else
  echo "OK: .gitignore sessions/"
fi
tracked_sessions="$(git ls-files 'sessions' 'sessions/**' 2>/dev/null | head -1 || true)"
if [ -n "$tracked_sessions" ]; then
  echo "FAIL: sessions/ paths are tracked by git — untrack and keep local only"
  echo "  first: $tracked_sessions"
  fail=1
else
  echo "OK: sessions/ not tracked"
fi

if [ "$fail" -ne 0 ]; then
  echo "check-env-layout FAILED"
  exit 1
fi
echo "check-env-layout: ALL OK"
exit 0
