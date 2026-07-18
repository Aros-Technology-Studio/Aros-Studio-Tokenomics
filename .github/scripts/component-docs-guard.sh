#!/usr/bin/env bash
# component-docs-guard — required layer docs under docs/layers/* (not portal, not docs/components).
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
  # Each layer needs scope and/or model (acceptance optional for thin layers)
  if [ ! -d "$dir/00_scope" ] && [ ! -d "$dir/01_model" ] && [ ! -d "$dir/02_process" ]; then
    echo "::error::component-docs-guard: $dir missing 00_scope, 01_model, and 02_process"
    fail=1
  fi
done

# Core depth anchors (ledger SoT + PoT criteria + map)
for f in \
  docs/layers/README.md \
  docs/layers/01_NodeChain/01_ledger/journal-model.md \
  docs/layers/01_NodeChain/01_ledger/write-path.md \
  docs/layers/01_NodeChain/01_ledger/immutability.md \
  docs/layers/04_ProofOfTransaction/01_model/criteria-p1-p4.md \
  docs/layers/04_ProofOfTransaction/02_process/verify-flow.md \
  docs/layers/05_TokenManagement/01_model/mint-burn.md \
  docs/layers/08_AllSeeingEye/00_scope/non-goals.md \
  docs/STRUCTURE.md \
  docs/BACKLOG.md \
  docs/AST-CORE-CANON.md
do
  if [ ! -f "$f" ]; then
    echo "::error::component-docs-guard: missing $f"
    fail=1
  fi
done

# Must not require portal docs as component packs
if [ -d docs/components ]; then
  echo "::warning::component-docs-guard: docs/components/ is legacy; SoT packs live under docs/layers/"
fi

if [ "$fail" -ne 0 ]; then
  echo "component-docs-guard FAILED"
  exit 1
fi
echo "component-docs-guard: OK (${#REQUIRED_LAYERS[@]} layers under docs/layers; no portal)"
exit 0
