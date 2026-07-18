#!/usr/bin/env bash
# layout-scaffold-guard — layers architecture foundation (docs/layers + core src).
# Portal is NOT a required layout path (edge is optional / out of layout gate).
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
  docs/layers/LAYER_ISSUE_MAP.md \
  docs/layers/01_NodeChain/README.md \
  docs/layers/02_TxEncoding/README.md \
  docs/layers/03_Processing/README.md \
  docs/layers/04_ProofOfTransaction/README.md \
  docs/layers/05_TokenManagement/README.md \
  docs/layers/06_FeeCommission/README.md \
  docs/layers/07_Reserve/README.md \
  docs/layers/08_AllSeeingEye/README.md \
  docs/layers/09_Governance/README.md \
  docs/layers/10_AssetTokenization/README.md \
  CANON.md \
  README.md \
  AGENTS.md \
  package.json \
  nest-cli.json \
  Dockerfile \
  docker-compose.yml \
  .env.example \
  CONTRIBUTING.md \
  SECURITY.md \
  CHANGELOG.md \
  docs/ROADMAP.md \
  docs/INTAKE.md \
  docs/db/postgres-index-schema.sql \
  contracts/src/representation/ArosCoinView.sol \
  rust/Cargo.toml \
  rules/AST_RULES.yaml \
  src/main.ts \
  src/app.module.ts \
  src/nodechain/nodechain.service.ts \
  src/pot/pot.service.ts \
  src/invariants/ok-to-emit.ts \
  src/orchestrator/orchestrator.service.ts \
  src/intake/tokenization.pipeline.ts \
  src/token/token.service.ts \
  src/commission/commission.service.ts \
  src/reserve/reserve.service.ts \
  src/all-seeing-eye/all-seeing-eye.service.ts
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
  .github/workflows/no-all-seeing-eye-executive-guard.yml \
  .github/workflows/component-docs-guard.yml \
  .github/workflows/layout-scaffold-guard.yml \
  .github/workflows/domain-invariants-guard.yml \
  .github/workflows/ast-guards.yml \
  .github/workflows/invariants.yml \
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

for s in \
  .github/scripts/run-all-guards.sh \
  .github/scripts/canon-gate.sh \
  .github/scripts/ast-philosophy-guard.sh \
  .github/scripts/token-protocol-guard.sh \
  .github/scripts/no-bypass-pot-nodechain.sh \
  .github/scripts/pot-criteria-guard.sh \
  .github/scripts/no-all-seeing-eye-executive-guard.sh \
  .github/scripts/component-docs-guard.sh \
  .github/scripts/layout-scaffold-guard.sh \
  .github/scripts/domain-invariants-guard.sh \
  .github/scripts/require-canon-update.sh \
  .github/scripts/migration-doc-gate.sh
do
  if [ ! -f "$s" ]; then
    echo "::error::layout-scaffold-guard: missing script $s"
    fail=1
  fi
done

# Explicitly do NOT require portal/* — layout gate is layers + core only.
if [ -d portal ]; then
  echo "layout-scaffold-guard: portal/ present (edge optional; not required by layout gate)"
fi

if [ "$fail" -ne 0 ]; then
  echo "layout-scaffold-guard FAILED"
  exit 1
fi
echo "layout-scaffold-guard: OK (docs/layers + core; no portal requirement)"
exit 0
