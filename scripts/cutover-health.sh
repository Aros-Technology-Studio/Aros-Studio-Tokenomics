#!/usr/bin/env bash
# E4 — post-deploy health + metrics smoke.
# Usage:
#   npm run cutover:health
#   npm run cutover:health -- --base https://ast.example.com
#   npm run cutover:health -- --core http://127.0.0.1:3000 --edge http://127.0.0.1:3100
set -euo pipefail

BASE=""
CORE="${CORE_API_URL:-http://127.0.0.1:3000}"
EDGE="${PORTAL_EDGE_URL:-http://127.0.0.1:3100}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base) BASE="$2"; shift 2 ;;
    --core) CORE="$2"; shift 2 ;;
    --edge) EDGE="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,10p' "$0"
      exit 0
      ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

if [[ -n "$BASE" ]]; then
  BASE="${BASE%/}"
  # same-origin portal: core may still be internal — try edge health on base first
  EDGE="$BASE"
  # optional core if exposed under / or separate — try AST_CORE_PUBLIC
  CORE="${AST_CORE_PUBLIC_URL:-$CORE}"
fi

fail() { echo "FAIL: $*"; exit 1; }
pass() { echo "PASS  $*"; }

echo "E4 cutover health"
echo "  core: $CORE"
echo "  edge: $EDGE"
echo ""

# Core health
ch="$(curl -fsS --max-time 8 "$CORE/health" 2>/dev/null || true)"
[[ -n "$ch" ]] || fail "core /health unreachable at $CORE/health"
echo "$ch" | grep -q '"ok":true\|"ok": true' || fail "core health not ok: $ch"
pass "core /health"

# Core metrics
cm="$(curl -fsS --max-time 8 "$CORE/metrics" 2>/dev/null || true)"
[[ -n "$cm" ]] || fail "core /metrics unreachable"
echo "$cm" | grep -q 'ast_up 1' || fail "metrics missing ast_up 1"
pass "core /metrics (ast_up 1)"

# Edge health (path may be /v1/health)
eh="$(curl -fsS --max-time 8 "$EDGE/v1/health" 2>/dev/null || curl -fsS --max-time 8 "$EDGE/health" 2>/dev/null || true)"
[[ -n "$eh" ]] || fail "edge health unreachable at $EDGE/v1/health"
echo "$eh" | grep -Eqi '"status"[[:space:]]*:[[:space:]]*"ok"|"ok"[[:space:]]*:[[:space:]]*true' \
  || fail "edge health not ok: $eh"
pass "edge health"

echo ""
echo "E4 HEALTH PASS"
exit 0
