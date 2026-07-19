#!/usr/bin/env bash
# Start AST at home: Core + Portal edge + Portal UI (same-origin API).
# Usage: bash scripts/home-up.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo 127.0.0.1)"
LOG_DIR="${AST_HOME_LOG_DIR:-$ROOT/.home-run}"
mkdir -p "$LOG_DIR"

export AST_JOURNAL_ENGINE="${AST_JOURNAL_ENGINE:-file}"
export AST_JOURNAL_DIR="${AST_JOURNAL_DIR:-$ROOT/data/journal-home}"
export AST_REQUIRE_CRYPTO="${AST_REQUIRE_CRYPTO:-0}"
export AST_KEY_PROVIDER="${AST_KEY_PROVIDER:-memory}"
export AST_INSTITUTION_TOKEN="${AST_INSTITUTION_TOKEN:-demo-institution-token}"
export KILL_SWITCH="${KILL_SWITCH:-false}"
export PORT="${PORT:-3000}"
export PORTAL_PORT="${PORTAL_PORT:-3100}"
export CORE_API_URL="${CORE_API_URL:-http://127.0.0.1:3000}"
export PORTAL_CORE_HANDOFF="${PORTAL_CORE_HANDOFF:-true}"
# Browser uses same-origin rewrites (home / public tunnel)
export NEXT_PUBLIC_PORTAL_API_URL="${NEXT_PUBLIC_PORTAL_API_URL:-}"
export PORTAL_EDGE_URL="${PORTAL_EDGE_URL:-http://127.0.0.1:3100}"

mkdir -p "$AST_JOURNAL_DIR"

echo "==> Installing deps if needed"
if [[ ! -d node_modules ]]; then npm ci; fi
if [[ ! -d portal/backend/node_modules ]]; then npm --prefix portal/backend ci; fi
if [[ ! -d portal/frontend/node_modules ]]; then npm --prefix portal/frontend ci; fi

echo "==> Building core"
npm run build

stop_pids() {
  for f in core edge ui; do
    if [[ -f "$LOG_DIR/$f.pid" ]]; then
      pid="$(cat "$LOG_DIR/$f.pid" || true)"
      if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
      rm -f "$LOG_DIR/$f.pid"
    fi
  done
}
stop_pids

echo "==> Starting Core :$PORT"
nohup env PORT="$PORT" \
  AST_JOURNAL_ENGINE="$AST_JOURNAL_ENGINE" \
  AST_JOURNAL_DIR="$AST_JOURNAL_DIR" \
  AST_KEY_PROVIDER="$AST_KEY_PROVIDER" \
  AST_INSTITUTION_TOKEN="$AST_INSTITUTION_TOKEN" \
  KILL_SWITCH="$KILL_SWITCH" \
  node dist/src/main.js >"$LOG_DIR/core.log" 2>&1 &
echo $! >"$LOG_DIR/core.pid"

echo "==> Starting Portal edge :$PORTAL_PORT"
nohup env PORTAL_PORT="$PORTAL_PORT" \
  CORE_API_URL="$CORE_API_URL" \
  PORTAL_CORE_HANDOFF="$PORTAL_CORE_HANDOFF" \
  AST_INSTITUTION_TOKEN="$AST_INSTITUTION_TOKEN" \
  npm --prefix portal/backend run start:dev >"$LOG_DIR/edge.log" 2>&1 &
echo $! >"$LOG_DIR/edge.pid"

echo "==> Starting Portal UI :3200 (same-origin /v1 → edge)"
nohup env PORT=3200 \
  NEXT_PUBLIC_PORTAL_API_URL="" \
  PORTAL_EDGE_URL="$PORTAL_EDGE_URL" \
  npm --prefix portal/frontend run dev >"$LOG_DIR/ui.log" 2>&1 &
echo $! >"$LOG_DIR/ui.pid"

sleep 3
echo ""
echo "AST home stack is up."
echo "  LAN UI:   http://${LAN_IP}:3200"
echo "  Local:    http://127.0.0.1:3200"
echo "  Core:     http://${LAN_IP}:3000/health"
echo "  Edge:     http://${LAN_IP}:3100/v1/health"
echo "  Login:    DEMO / demo-institution-token"
echo "  Logs:     $LOG_DIR/*.log"
echo "  Stop:     bash scripts/home-down.sh"
echo ""
echo "Public access from internet (no domain):"
echo "  bash scripts/home-tunnel.sh"
