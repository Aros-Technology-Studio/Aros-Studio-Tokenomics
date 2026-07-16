#!/usr/bin/env bash
# pot-criteria-guard — PoT Criteria P1–P4 must remain in CANON; verdict requires all-pass.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0

if [ ! -f docs/AST-CORE-CANON.md ]; then
  echo "::error::docs/AST-CORE-CANON.md missing"
  exit 1
fi

for needle in \
  "#### PoT Criteria (P1–P4)" \
  "**P1**" \
  "**P2**" \
  "**P3**" \
  "**P4**" \
  "criteriaResult" \
  "verified = 1"
do
  if ! grep -qF "$needle" docs/AST-CORE-CANON.md; then
    echo "::error::pot-criteria-guard: docs/AST-CORE-CANON.md missing required PoT anchor: $needle"
    fail=1
  fi
done

# Criteria must say all four apply / fail any → verified 0
if ! grep -qE 'all four|All four' docs/AST-CORE-CANON.md; then
  echo "::error::pot-criteria-guard: CANON must require all four criteria in v1"
  fail=1
fi

# Product code must not claim verified=1 without criteria (heuristic)
if [ -d src ]; then
  hits="$(grep -RInE 'verified\s*=\s*1' src --include='*.ts' 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    bad="$(echo "$hits" | grep -viE 'criteria|P1|P2|P3|P4|after.*quorum|only when' || true)"
    if [ -n "$bad" ]; then
      echo "::warning::pot-criteria-guard: verified=1 assignments in src — ensure criteriaResult P1–P4 gate on each path"
      echo "$bad"
    fi
  fi
fi

if [ "$fail" -ne 0 ]; then
  echo "pot-criteria-guard FAILED"
  exit 1
fi
echo "pot-criteria-guard: OK"
exit 0
