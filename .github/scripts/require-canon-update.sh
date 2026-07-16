#!/usr/bin/env bash
# require-canon-update — architectural diffs must update the Core Canon file.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

BASE_REF="${BASE_REF:-}"
HEAD_REF="${HEAD_REF:-HEAD}"

if [ -n "${GITHUB_BASE_REF:-}" ] && [ -n "${GITHUB_SHA:-}" ]; then
  git fetch origin "${GITHUB_BASE_REF}" --depth=1 2>/dev/null || true
  BASE_REF="origin/${GITHUB_BASE_REF}"
  HEAD_REF="${GITHUB_SHA}"
elif [ -z "$BASE_REF" ]; then
  if git rev-parse HEAD^ >/dev/null 2>&1; then
    BASE_REF="HEAD^"
  else
    echo "require-canon-update: single commit / no base — skip."
    exit 0
  fi
fi

CHANGED="$(git diff --name-only "$BASE_REF"..."$HEAD_REF" 2>/dev/null || git diff --name-only "$BASE_REF" "$HEAD_REF")"

if [ -z "$CHANGED" ]; then
  echo "require-canon-update: no changed files."
  exit 0
fi

echo "Changed files:"
echo "$CHANGED"

ARCH_REGEX='^(src/|docs/ARCHITECTURE\.md|docs/AST-CORE-CANON\.md|docs/PORTAL\.md|docs/components/|docs/DOC_MAP\.md|docs/BUILD_SCHEDULE\.md|docs/WORKFLOWS\.md|docs/principles/|docs/processes/|smart-contracts/|nodechain/|pot-engine/|portal/|aroscoin/|package\.json|tsconfig.*\.json)'

arch_hits="$(echo "$CHANGED" | grep -E "$ARCH_REGEX" || true)"
canon_hit="$(echo "$CHANGED" | grep -E '^(docs/AST-CORE-CANON\.md|CANON\.md)$' || true)"

if [ -z "$arch_hits" ]; then
  echo "require-canon-update: no architectural paths changed — OK."
  exit 0
fi

if [ -n "$canon_hit" ]; then
  echo "require-canon-update: architectural change includes Core Canon — OK."
  exit 0
fi

echo "::error::Architectural paths changed without updating docs/AST-CORE-CANON.md (or root CANON.md pointer)."
echo "Architectural files in this diff:"
echo "$arch_hits"
exit 1
