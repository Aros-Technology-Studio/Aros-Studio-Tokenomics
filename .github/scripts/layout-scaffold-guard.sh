#!/usr/bin/env bash
# layout-scaffold-guard — foundation layout + protective workflows (post clean-slate).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0

for path in \
  docs/AST-CORE-CANON.md \
  docs/P0-P4-TECHNICAL-DECISIONS.md \
  docs/BUILD_SCHEDULE.md \
  docs/STRUCTURE.md \
  docs/BACKLOG.md \
  docs/HARDENING.md \
  docs/layers/README.md \
  docs/layers/01_NodeChain/README.md \
  docs/layers/04_ProofOfTransaction/README.md \
  docs/layers/10_AssetTokenization/README.md \
  CANON.md \
  README.md \
  AGENTS.md \
  package.json \
  src/nodechain/nodechain.service.ts \
  src/intake/tokenization.pipeline.ts \
  rules/AST_RULES.yaml
do
  if [ ! -f "$path" ]; then
    echo "::error::layout-scaffold-guard: missing required path $path"
    fail=1
  fi
done

for wf in \
  .github/workflows/ast-philosophy-guard.yml \
  .github/workflows/require-canon-update.yml \
  .github/workflows/token-protocol-guard.yml \
  .github/workflows/no-bypass-pot-nodechain.yml \
  .github/workflows/pot-criteria-guard.yml \
  .github/workflows/no-eye-executive-guard.yml \
  .github/workflows/component-docs-guard.yml \
  .github/workflows/layout-scaffold-guard.yml \
  .github/workflows/domain-invariants-guard.yml \
  .github/workflows/ast-guards.yml \
  .github/workflows/migration-doc-gate.yml \
  .github/workflows/ci.yml \
  .github/workflows/canon-gate.yml \
  .github/workflows/nightly-canon-audit.yml
do
  if [ ! -f "$wf" ]; then
    echo "::error::layout-scaffold-guard: missing workflow $wf"
    fail=1
  fi
done

# Portal is out of scope — must not reappear as required layout
if [ -d portal ] && [ ! -f docs/BACKLOG.md ]; then
  echo "::warning::layout-scaffold-guard: portal/ present; product scope is portal-out"
fi

if [ "$fail" -ne 0 ]; then
  echo "layout-scaffold-guard FAILED"
  exit 1
fi
echo "layout-scaffold-guard: OK"
exit 0
