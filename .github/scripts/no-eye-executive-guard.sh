#!/usr/bin/env bash
# no-eye-executive-guard — All-Seeing Eye: observe/notify only (CANON §4.3, §X).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0

EXCLUDES=(--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.github)
SCAN=(src docs)

# Positive executive powers (filter out explicit negations)
PATTERNS=(
  'allSeeingEye\.(veto|rollback|mint|burn|pay|settle)'
  'eye\.(veto|rollback)\s*\('
  'function\s+veto\s*\('
  'EyeVeto|eyeRollback|executeVeto'
  'all-seeing-eye[^\n]{0,80}(initiates?\s+mint|can\s+rollback)'
)

for pattern in "${PATTERNS[@]}"; do
  hits="$(grep -RInE "$pattern" "${SCAN[@]}" "${EXCLUDES[@]}" 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    filtered="$(echo "$hits" | grep -viE 'must not|does not|no veto|never |forbidden|without veto|not have veto|observe only|notify only' || true)"
    if [ -n "$filtered" ]; then
      echo "::error::no-eye-executive-guard: Eye must not have executive powers (CANON §4.3)."
      echo "$filtered"
      fail=1
    fi
  fi
done

# CANON must still forbid Eye veto/rollback
if ! grep -qF 'does **not** have veto or rollback' docs/AST-CORE-CANON.md && ! grep -qi 'not have veto or rollback' docs/AST-CORE-CANON.md; then
  echo "::error::no-eye-executive-guard: docs/AST-CORE-CANON.md must state Eye has no veto/rollback"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "no-eye-executive-guard FAILED"
  exit 1
fi
echo "no-eye-executive-guard: OK"
exit 0
