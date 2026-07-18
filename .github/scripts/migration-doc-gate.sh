#!/usr/bin/env bash
# migration-doc-gate — scan candidate docs (default: migration/inbox) against Core Canon hard rules.
# Usage:
#   bash .github/scripts/migration-doc-gate.sh [path]
# Exit 0 = PASS (or empty inbox). Exit 1 = FAIL.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

TARGET="${1:-migration/inbox}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT_DIR="migration/reports"
mkdir -p "$REPORT_DIR"
REPORT="$REPORT_DIR/migration-gate-${STAMP}.txt"

if [ ! -e "$TARGET" ]; then
  echo "::error::migration-doc-gate: target not found: $TARGET"
  exit 1
fi

# Collect text-like files (bash 3.2 compatible — no mapfile)
FILES_TMP="$(mktemp)"
find "$TARGET" -type f \
  \( -name '*.md' -o -name '*.mdx' -o -name '*.txt' -o -name '*.markdown' \) \
  ! -name 'README.md' \
  2>/dev/null | sort > "$FILES_TMP" || true

FILE_COUNT="$(wc -l < "$FILES_TMP" | tr -d ' ')"

# Allow empty inbox (ready for migration, nothing to scan)
if [ ! -s "$FILES_TMP" ]; then
  rm -f "$FILES_TMP"
  echo "migration-doc-gate: no candidate documents under $TARGET (empty is OK)."
  echo "EMPTY $(date -u +%Y-%m-%dT%H:%M:%SZ) target=$TARGET" > "$REPORT_DIR/migration-gate-latest.txt"
  exit 0
fi

fail=0
{
  echo "AST migration-doc-gate"
  echo "UTC: $STAMP"
  echo "Target: $TARGET"
  echo "Files: $FILE_COUNT"
  echo "Canon: CANON.md"
  echo "----"
} > "$REPORT"

check_file() {
  local f="$1"
  local file_fail=0
  local hits filtered

  scan() {
    local name="$1"
    local pat="$2"
    hits="$(grep -nIE "$pat" "$f" 2>/dev/null || true)"
    if [ -z "$hits" ]; then
      return 0
    fi
    filtered="$(echo "$hits" | grep -viE \
      'must not|mustn.t|do not|don.t|never |forbidden|prohibit|not allowed|without |no veto|not have veto|observe only|adapters? only|legacy|do not migrate|hard prohibition|§X|banned|reject(s|ed)?|not a live|negation|DEPRECATED|DROP|quarantine' \
      || true)"
    if [ -n "$filtered" ]; then
      echo "FAIL [$name] $f" | tee -a "$REPORT"
      echo "$filtered" | sed 's/^/  /' | tee -a "$REPORT"
      file_fail=1
      fail=1
    fi
  }

  scan "firewall-afc" 'AFC|Aros Financial Core|LacMusa|Fiat Anchor|Crypto Anchor|Aros Logic Bridge|\bALB\b'
  scan "vocab-yield" '\breward(s)?\b|\bincentive(s)?\b|\bstimulus\b'
  scan "eye-executive" 'eye[^\n]{0,40}(veto|rollback)|(veto|rollback)[^\n]{0,40}(eye|all[- ]seeing)|allSeeingEye\.(veto|rollback|mint|burn)|EyeVeto|eyeRollback'
  scan "premine-stake" '\bpre[- ]?mine\b|free\s+emission|mintOnDeposit|\bstaking[- ]for[- ]yield\b|\byield\s*farm'
  scan "bypass" 'bypass[_-]?(pot|nodechain)|skip[_-]?(pot|nodechain)|POT_BYPASS|NODECHAIN_BYPASS|adminMint|godModeMint|forceMint|mintWithout(Verdict|PoT)'
  scan "erc-sot" 'native\s+ERC-?20|ERC-?20\s+is\s+(the\s+)?(source of truth|canonical|protocol)|source of truth[^\n]{0,40}ERC'
  scan "custody" 'custod(y|ian)\s+of\s+(client|user|participant|customer)|hold(s|ing)\s+customer\s+(funds|deposits)'
  scan "self-appraisal" 'AST\s+(calculates|appraises|values)\s+(the\s+)?asset|oracle\s+sets\s+official\s+price\s+for\s+AST'

  if [ "$file_fail" -eq 0 ]; then
    echo "PASS $f" | tee -a "$REPORT"
  fi
}

echo "Scanning $FILE_COUNT file(s) under $TARGET ..."
while IFS= read -r f; do
  [ -n "$f" ] || continue
  check_file "$f"
done < "$FILES_TMP"
rm -f "$FILES_TMP"

{
  echo "----"
  if [ "$fail" -ne 0 ]; then
    echo "RESULT: FAIL"
  else
    echo "RESULT: PASS"
  fi
  echo "Next: human checklist docs/migration/REVIEW_CHECKLIST.md"
  echo "See: docs/MIGRATION_GATE.md"
} | tee -a "$REPORT"

cp "$REPORT" "$REPORT_DIR/migration-gate-latest.txt"

if [ "$fail" -ne 0 ]; then
  echo "::error::migration-doc-gate FAILED — see $REPORT"
  echo "Move failing files to migration/quarantine/ or rewrite until PASS."
  exit 1
fi

echo "migration-doc-gate: PASS (all candidates clean of hard conflicts)"
exit 0
