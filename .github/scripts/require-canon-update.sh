#!/usr/bin/env bash
# require-canon-update — architectural diffs must update CANON.md (or justify via path rules).
# On pull_request: if architecture-bearing paths change, CANON.md must also be in the diff
# unless the PR only touches non-architectural files.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Local default: compare working tree + index to HEAD
BASE_REF="${BASE_REF:-}"
HEAD_REF="${HEAD_REF:-HEAD}"

if [ -n "${GITHUB_BASE_REF:-}" ] && [ -n "${GITHUB_SHA:-}" ]; then
  # Pull request context (after checkout with fetch-depth 0)
  git fetch origin "${GITHUB_BASE_REF}" --depth=1 2>/dev/null || true
  BASE_REF="origin/${GITHUB_BASE_REF}"
  HEAD_REF="${GITHUB_SHA}"
elif [ -z "$BASE_REF" ]; then
  # Push to main: compare to previous commit if available
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

# Paths that imply architectural / protocol change
ARCH_REGEX='^(src/|docs/ARCHITECTURE\.md|docs/components/|docs/DOC_MAP\.md|docs/WORK_PLAN\.md|docs/principles/|smart-contracts/|contracts/|reference/|nodechain/|pot-engine/|aroscoin/|governance/|portal/|package\.json|tsconfig.*\.json)'

arch_hits="$(echo "$CHANGED" | grep -E "$ARCH_REGEX" || true)"
canon_hit="$(echo "$CHANGED" | grep -E '^CANON\.md$' || true)"
# Allow amending only guard scripts without canon churn
only_ci="$(echo "$CHANGED" | grep -vE '^(\.github/|AGENTS\.md$)' || true)"

if [ -z "$arch_hits" ]; then
  echo "require-canon-update: no architectural paths changed — OK."
  exit 0
fi

if [ -n "$canon_hit" ]; then
  echo "require-canon-update: architectural change includes CANON.md — OK."
  exit 0
fi

# Pure workflow/script-only PR under .github that also touches docs? still require if docs architecture
echo "::error::Architectural paths changed without updating CANON.md."
echo "Architectural files in this diff:"
echo "$arch_hits"
echo ""
echo "AST rule: structural/protocol changes must keep the Core Canon in sync (CANON.md)."
echo "Either update CANON.md in this PR, or split non-architectural work into a separate PR."
exit 1
