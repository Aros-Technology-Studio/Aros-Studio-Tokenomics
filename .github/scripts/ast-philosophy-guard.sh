#!/usr/bin/env bash
# ast-philosophy-guard — main defender of AST Core Canon principles.
# Fails if repository content introduces hard-forbidden mechanics (CANON.md §X, §III).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

EXCLUDES=(
  --exclude-dir=.git
  --exclude-dir=node_modules
  --exclude-dir=dist
  --exclude=package-lock.json
  --exclude=yarn.lock
  --exclude=pnpm-lock.yaml
  '--exclude=*.lock'
)

# These scripts and this workflow set may mention forbidden concepts as *negations*.
# Scan product content only (not the guard machinery).
# Product / derived docs and code only. CANON.md is checked for anchors, not for ban lists.
SCAN_PATHS=(src docs AGENTS.md package.json)
for d in smart-contracts reference frontend contracts; do
  [ -d "$d" ] && SCAN_PATHS+=("$d")
done

fail=0

if [ ! -f CANON.md ]; then
  echo "::error::CANON.md missing — AST Core Canon is required as source of truth."
  exit 1
fi

# Required section anchors (English final canon)
for needle in \
  "## I. Mission of AST" \
  "## III. First principles" \
  "## IV. Architectural canons" \
  "### 4.1. NodeChain" \
  "### 4.2. Proof of Transaction" \
  "### 4.3. The All-Seeing Eye" \
  "## VI. Token canons (AST Token Protocol)" \
  "## X. Hard prohibitions" \
  "## XI. Invariants" \
  "**I1.**" \
  "**I9.**"
do
  if ! grep -qF "$needle" CANON.md; then
    echo "::error::CANON.md is missing required anchor: $needle"
    fail=1
  fi
done

# Live-mechanic patterns in product content (not the ban list inside CANON.md).

check_pattern() {
  local name="$1"
  local pattern="$2"
  local hits
  hits="$(grep -RInE "$pattern" "${SCAN_PATHS[@]}" "${EXCLUDES[@]}" 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    # Drop explicit negations / out-of-scope listings / questionnaires
    filtered="$(echo "$hits" | grep -viE \
      'forbidden|prohibit|must not|do not|don'\''t|never |hard ban|§X|hard prohibition|without veto|no veto|not have veto|does \*\*not\*\* have|out of scope|not started|not a |is \*\*not\*\*|are forbidden|is forbidden|blocks? |avoid |negation|questionnaire|`A:`|staking-for-yield,|caps, staking' \
      || true)"
    if [ -n "$filtered" ]; then
      echo "::error::Philosophy breach [$name] — conflicts with CANON.md hard principles."
      echo "$filtered"
      fail=1
    fi
  fi
}

# Eye must not gain veto/rollback as a feature in product code/docs (positive framing)
check_pattern "eye-veto" 'eye[^\n]{0,40}(veto|rollback)|(veto|rollback)[^\n]{0,40}(all[- ]seeing|the eye)|allSeeingEye\.(veto|rollback)|function\s+veto\s*\('

# Pre-mine / free mint as a feature
check_pattern "premine" '\bpre[- ]?mine\b|\bfree\s+emission\b|\bmintOnDeposit\b|\binitialSupply\s*[:=]'

# Staking / farming as product mechanics
check_pattern "staking-farming" '\bstaking[- ]for[- ]yield\b|\byield\s*farm|\bfarming\s+reward\b|\bstake\s*\(\s*amount'

# System self-valuation of assets
check_pattern "self-appraisal" 'AST\s+(calculates|appraises|values)\s+(the\s+)?asset|oraclePrice\s*=\s*astInternal'

# Third-party custody
check_pattern "third-party-custody" 'custod(y|ian)\s+of\s+(client|user|participant|third[- ]party)\s+funds|hold(s|ing)\s+customer\s+deposits'

# Speculative market defense
check_pattern "speculative-surface" '\bprice[- ]?floor\b|\bbuyback\b|\bvolatility\s+control\b|\bgovernance[- ]by[- ]holding\b'

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "ast-philosophy-guard FAILED. See CANON.md §§III, X, XI."
  exit 1
fi

echo "ast-philosophy-guard: OK (canon anchors present; no hard-forbidden live mechanics detected)."
exit 0
