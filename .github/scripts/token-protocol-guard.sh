#!/usr/bin/env bash
# token-protocol-guard — AST Token Protocol is canonical; ERC standards are adapters only.
# Forbids treating a specific ERC (20/3643/1400/etc.) as the protocol source of truth.
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

SCAN_PATHS=(src docs CANON.md)
for d in smart-contracts contracts reference frontend; do
  [ -d "$d" ] && SCAN_PATHS+=("$d")
done

fail=0

# Positive claims that ERC is the native/canonical protocol
FORBIDDEN_NATIVE=(
  'native\s+ERC-?20'
  'ERC-?20\s+is\s+(the\s+)?(source of truth|canonical|protocol)'
  'canonical\s+ERC-?(20|3643|1400)'
  'source of truth[^\n]{0,60}ERC-?(20|3643|1400)'
  'ERC-?(20|3643|1400)[^\n]{0,60}source of truth'
  'we\s+are\s+an?\s+ERC-?20\s+(token|protocol)'
  'implements\s+only\s+ERC-?(20|3643|1400)'
  'OpenZeppelin\s+ERC20\s+as\s+(the\s+)?(core|canonical)\s+protocol'
)

for pattern in "${FORBIDDEN_NATIVE[@]}"; do
  hits="$(grep -RInE "$pattern" "${SCAN_PATHS[@]}" "${EXCLUDES[@]}" 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    echo "::error::token-protocol-guard: ERC must not be the protocol source of truth (CANON.md §VI)."
    echo "$hits"
    fail=1
  fi
done

# Hard dependency patterns in TypeScript/Solidity product code that bind core token to one ERC
if [ -d src ]; then
  code_hits="$(grep -RInE 'from\s+['\''"]@openzeppelin/contracts/token/ERC20|IERC20\s+as\s+IAros|extends\s+ERC20\b' src \
    --include='*.ts' --include='*.sol' 2>/dev/null || true)"
  if [ -n "$code_hits" ]; then
    # Allow files under paths that explicitly say adapter
    filtered="$(echo "$code_hits" | grep -viE 'adapter|representation|erc-?adapter' || true)"
    if [ -n "$filtered" ]; then
      echo "::error::token-protocol-guard: core src binds to ERC without adapter path (CANON.md §6.2)."
      echo "$filtered"
      fail=1
    fi
  fi
fi

# Soft reminder: CANON must still describe AST Token Protocol
if ! grep -q 'AST Token Protocol' CANON.md; then
  echo "::error::CANON.md must define AST Token Protocol."
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "token-protocol-guard FAILED. Canonical layer = NodeChain + PoT; ERC = Representation Adapters only."
  exit 1
fi

echo "token-protocol-guard: OK."
exit 0
