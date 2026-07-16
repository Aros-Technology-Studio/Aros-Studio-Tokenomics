#!/usr/bin/env bash
# no-bypass-pot-nodechain — blocks attempts to skip PoT or NodeChain (CANON.md §4.1, §4.2, §8.2, §X).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

EXCLUDES=(
  --exclude-dir=.git
  --exclude-dir=node_modules
  --exclude-dir=dist
  --exclude-dir=.github
  --exclude=package-lock.json
  '--exclude=*.lock'
)

SCAN_PATHS=(src docs)
for d in smart-contracts contracts reference frontend; do
  [ -d "$d" ] && SCAN_PATHS+=("$d")
done

# Always scan if paths exist; empty src is fine
fail=0

PATTERNS=(
  'bypass[_-]?(pot|nodechain|proof[_-]?of[_-]?transaction)'
  'skip[_-]?(pot|nodechain)\b'
  'without[_-]?(pot|nodechain)\b'
  'no[_-]?pot[_-]?(check|required|gate)'
  'no[_-]?nodechain[_-]?(write|record|append)'
  'disable[_-]?(pot|nodechain)'
  'POT_BYPASS|NODECHAIN_BYPASS|SKIP_POT|SKIP_NODECHAIN'
  'verified\s*=\s*1\s*;\s*//\s*(force|fake|bypass|skip)'
  'mint[^\n]{0,80}(without|skip).{0,40}(pot|verdict)'
  'emit[^\n]{0,80}(without|skip).{0,40}(pot|nodechain)'
)

for pattern in "${PATTERNS[@]}"; do
  hits="$(grep -RInE "$pattern" "${SCAN_PATHS[@]}" "${EXCLUDES[@]}" 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    # Allow lines that forbid bypass
    filtered="$(echo "$hits" | grep -viE 'must not|forbidden|prohibit|do not|never |blocks? bypass|no bypass|cannot bypass|must not bypass' || true)"
    if [ -n "$filtered" ]; then
      echo "::error::no-bypass-pot-nodechain: possible PoT/NodeChain bypass (CANON.md §X)."
      echo "$filtered"
      fail=1
    fi
  fi
done

# Direct mint APIs that ignore PoT in naming (heuristic for src only)
if [ -d src ]; then
  hits="$(grep -RInE 'forceMint|adminMint|godModeMint|mintWithoutVerdict|unsafeMint' src \
    --include='*.ts' --include='*.js' 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    echo "::error::no-bypass-pot-nodechain: mint path that suggests PoT bypass in src/."
    echo "$hits"
    fail=1
  fi
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "no-bypass-pot-nodechain FAILED. Significant operations require NodeChain record + PoT verified=1."
  exit 1
fi

echo "no-bypass-pot-nodechain: OK."
exit 0
