#!/usr/bin/env bash
# component-docs-guard — required component packs (4 files each) must exist.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0

REQUIRED_PACKS=(
  invariants pot reserve aroscoin
  nodechain nodes emission commission all-seeing-eye
  orchestrator state-recording release common
  partial-release release-daemon velocity-tracker node-reputation oracle-gateway
)

FILES=(PURPOSE.md MODEL.md CONTRACT.md ACCEPTANCE.md)

for pack in "${REQUIRED_PACKS[@]}"; do
  dir="docs/components/$pack"
  if [ ! -d "$dir" ]; then
    echo "::error::component-docs-guard: missing pack directory $dir"
    fail=1
    continue
  fi
  for f in "${FILES[@]}"; do
    if [ ! -f "$dir/$f" ]; then
      echo "::error::component-docs-guard: missing $dir/$f"
      fail=1
    fi
  done
done

if [ ! -f docs/DOC_MAP.md ]; then
  echo "::error::component-docs-guard: docs/DOC_MAP.md missing"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "component-docs-guard FAILED"
  exit 1
fi
echo "component-docs-guard: OK (${#REQUIRED_PACKS[@]} packs)"
exit 0
