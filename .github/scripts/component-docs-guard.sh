#!/usr/bin/env bash
# component-docs-guard — required layer docs (post clean-slate: docs/layers/*).
# Historical name kept so workflow files stay stable.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0

REQUIRED_LAYERS=(
  01_NodeChain
  02_TxEncoding
  03_Processing
  04_ProofOfTransaction
  05_TokenManagement
  06_FeeCommission
  07_Reserve
  08_AllSeeingEye
  09_Governance
  10_AssetTokenization
)

for layer in "${REQUIRED_LAYERS[@]}"; do
  dir="docs/layers/$layer"
  if [ ! -d "$dir" ]; then
    echo "::error::component-docs-guard: missing layer directory $dir"
    fail=1
    continue
  fi
  if [ ! -f "$dir/README.md" ]; then
    echo "::error::component-docs-guard: missing $dir/README.md"
    fail=1
  fi
  if [ ! -d "$dir/00_scope" ] && [ "$layer" != "01_NodeChain" ]; then
    # 01 has deep tree; others must have at least scope or model
    if [ ! -d "$dir/01_model" ] && [ ! -d "$dir/02_process" ]; then
      echo "::warning::component-docs-guard: $dir has no 00_scope/01_model (thin layer?)"
    fi
  fi
done

# NodeChain core depth (ledger SoT)
for f in \
  docs/layers/01_NodeChain/01_ledger/journal-model.md \
  docs/layers/01_NodeChain/01_ledger/write-path.md \
  docs/layers/04_ProofOfTransaction/01_model/criteria-p1-p4.md \
  docs/STRUCTURE.md \
  docs/BACKLOG.md
do
  if [ ! -f "$f" ]; then
    echo "::error::component-docs-guard: missing $f"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "component-docs-guard FAILED"
  exit 1
fi
echo "component-docs-guard: OK (${#REQUIRED_LAYERS[@]} layers)"
exit 0
