#!/usr/bin/env bash
# E2 — deploy ArosCoinView to RPC (testnet / anvil) via forge build + cast create.
# Usage:
#   export RPC_URL=… DEPLOYER_PK=… REPORTER=0x…
#   npm run contracts:deploy
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contracts"

REPORTER="${REPORTER:-}"
RPC_URL="${RPC_URL:-}"
DEPLOYER_PK="${DEPLOYER_PK:-${PRIVATE_KEY:-}}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reporter) REPORTER="$2"; shift 2 ;;
    --rpc-url) RPC_URL="$2"; shift 2 ;;
    --private-key) DEPLOYER_PK="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

command -v forge >/dev/null || { echo "forge not on PATH — install Foundry"; exit 1; }
command -v cast >/dev/null || { echo "cast not on PATH — install Foundry"; exit 1; }
[[ -n "$RPC_URL" ]] || { echo "RPC_URL required"; exit 1; }
[[ -n "$DEPLOYER_PK" ]] || { echo "DEPLOYER_PK required"; exit 1; }
[[ -n "$REPORTER" ]] || { echo "REPORTER (address) required"; exit 1; }
[[ "$REPORTER" =~ ^0x[a-fA-F0-9]{40}$ ]] || { echo "REPORTER must be 0x + 40 hex"; exit 1; }

echo "Building…"
forge build --silent

ART="out/ArosCoinView.sol/ArosCoinView.json"
[[ -f "$ART" ]] || { echo "missing $ART after forge build"; exit 1; }

BYTECODE="$(python3 -c "import json; print(json.load(open('$ART'))['bytecode']['object'])")"
[[ "$BYTECODE" == 0x* ]] || BYTECODE="0x$BYTECODE"
ARG="$(cast abi-encode 'constructor(address)' "$REPORTER")"
# Append ABI-encoded constructor args to init bytecode
DATA="${BYTECODE}${ARG#0x}"

echo "Deploying ArosCoinView reporter=$REPORTER rpc=$RPC_URL"
OUT="$(cast send --rpc-url "$RPC_URL" --private-key "$DEPLOYER_PK" --create "$DATA" --json 2>/dev/null \
  || cast send --rpc-url "$RPC_URL" --private-key "$DEPLOYER_PK" --create "$DATA" 2>&1)" || {
  echo "$OUT"
  exit 1
}
echo "$OUT"

ADDR=""
if echo "$OUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('contractAddress') or d.get('contract_address') or '')" 2>/dev/null; then
  ADDR="$(echo "$OUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('contractAddress') or d.get('contract_address') or '')" 2>/dev/null || true)"
fi
if [[ -z "$ADDR" ]]; then
  ADDR="$(echo "$OUT" | sed -n 's/.*contractAddress[[:space:]]*\(0x[a-fA-F0-9]\{40\}\).*/\1/p' | head -1)"
fi
if [[ -z "$ADDR" ]]; then
  ADDR="$(echo "$OUT" | grep -Eo '0x[a-fA-F0-9]{40}' | head -1 || true)"
fi

if [[ -n "$ADDR" ]]; then
  echo ""
  echo "ARO_VIEW=$ADDR"
  echo "export ARO_VIEW=$ADDR"
  echo "export AST_ARO_VIEW_CONTRACT=$ADDR"
  # quick verify
  R="$(cast call "$ADDR" 'reporter()(address)' --rpc-url "$RPC_URL" 2>/dev/null || true)"
  echo "on-chain reporter()=$R"
  echo "Next: npm run contracts:report-tip"
else
  echo "WARN: could not parse contract address from cast output"
fi
