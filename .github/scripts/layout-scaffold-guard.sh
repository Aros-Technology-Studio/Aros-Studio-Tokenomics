#!/usr/bin/env bash
# layout-scaffold-guard — owner P4 must-have layout aliases before/with implementation.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0

for path in \
  portal/README.md \
  nodechain/README.md \
  pot-engine/README.md \
  CANON.md \
  docs/DOC_MAP.md
do
  if [ ! -f "$path" ]; then
    echo "::error::layout-scaffold-guard: missing required path $path"
    fail=1
  fi
done

# Protective workflows must exist
for wf in \
  .github/workflows/ast-philosophy-guard.yml \
  .github/workflows/require-canon-update.yml \
  .github/workflows/token-protocol-guard.yml \
  .github/workflows/no-bypass-pot-nodechain.yml \
  .github/workflows/pot-criteria-guard.yml \
  .github/workflows/no-eye-executive-guard.yml \
  .github/workflows/component-docs-guard.yml \
  .github/workflows/layout-scaffold-guard.yml \
  .github/workflows/domain-invariants-guard.yml
do
  if [ ! -f "$wf" ]; then
    echo "::error::layout-scaffold-guard: missing workflow $wf"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "layout-scaffold-guard FAILED"
  exit 1
fi
echo "layout-scaffold-guard: OK"
exit 0
