#!/usr/bin/env bash
# Start permanent named Cloudflare Tunnel (domain → local Portal UI :3200).
# Prerequisite: bash scripts/domain-tunnel-setup.sh  (once)
# Stack:        bash scripts/home-up.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${AST_HOME_LOG_DIR:-$ROOT/.home-run}"
ROOT_BIN="$LOG_DIR/bin"
CFG_DIR="${CLOUDFLARED_CONFIG_DIR:-$HOME/.cloudflared}"
STATE_DIR="$LOG_DIR/cloudflare"
UI_URL="${AST_HOME_UI_URL:-http://127.0.0.1:3200}"
CONFIG_FILE="${AST_TUNNEL_CONFIG:-$CFG_DIR/config.yml}"

if [[ -f "$STATE_DIR/config-path.txt" ]]; then
  CONFIG_FILE="$(cat "$STATE_DIR/config-path.txt")"
fi

resolve_cloudflared() {
  local bin
  bin="$(command -v cloudflared 2>/dev/null || true)"
  if [[ -z "$bin" && -x "$ROOT_BIN/cloudflared" ]]; then
    bin="$ROOT_BIN/cloudflared"
  fi
  if [[ -z "$bin" ]]; then
    echo "cloudflared not found. Run: bash scripts/domain-tunnel-setup.sh"
    exit 1
  fi
  echo "$bin"
}

CLOUDFLARED="$(resolve_cloudflared)"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "ERROR: missing $CONFIG_FILE"
  echo "Run one-time setup first:"
  echo "  bash scripts/domain-tunnel-setup.sh arosfinancialcore.com"
  exit 1
fi

# Wait for local UI
echo "==> Waiting for Portal UI at $UI_URL ..."
ok=0
for i in $(seq 1 40); do
  if curl -sf "$UI_URL" >/dev/null 2>&1 || curl -sf "$UI_URL/v1/health" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 0.5
done
if [[ "$ok" -ne 1 ]]; then
  echo "WARN: UI not answering yet — starting tunnel anyway (will reconnect)."
  echo "      Prefer: bash scripts/home-up.sh first"
fi

# Stop previous tunnel (quick or named)
if [[ -f "$LOG_DIR/tunnel.pid" ]]; then
  old="$(cat "$LOG_DIR/tunnel.pid" || true)"
  if [[ -n "${old:-}" ]] && kill -0 "$old" 2>/dev/null; then
    echo "==> Stopping previous tunnel pid $old"
    kill "$old" 2>/dev/null || true
    sleep 0.5
  fi
  rm -f "$LOG_DIR/tunnel.pid"
fi

DOMAIN="$(cat "$STATE_DIR/domain.txt" 2>/dev/null || echo "${AST_PUBLIC_DOMAIN:-arosfinancialcore.com}")"
TUNNEL_NAME="$(cat "$STATE_DIR/tunnel-name.txt" 2>/dev/null || echo "${AST_TUNNEL_NAME:-ast-portal}")"

echo "==> Starting named tunnel '$TUNNEL_NAME' → $UI_URL"
echo "    config: $CONFIG_FILE"
nohup "$CLOUDFLARED" tunnel --config "$CONFIG_FILE" run "$TUNNEL_NAME" \
  --no-autoupdate >"$LOG_DIR/tunnel.log" 2>&1 &
echo $! >"$LOG_DIR/tunnel.pid"

PUBLIC="https://${DOMAIN}"
echo "$PUBLIC" >"$LOG_DIR/public-url.txt"

sleep 2
if ! kill -0 "$(cat "$LOG_DIR/tunnel.pid")" 2>/dev/null; then
  echo "ERROR: tunnel process exited. Last log lines:"
  tail -30 "$LOG_DIR/tunnel.log" || true
  exit 1
fi

echo ""
echo "========================================"
echo "  PERMANENT PUBLIC URL"
echo "  $PUBLIC"
echo "  https://www.${DOMAIN}"
echo "========================================"
echo "  Login: pilot / salt pilot"
echo "  Logs:  tail -f $LOG_DIR/tunnel.log"
echo "  Stop:  bash scripts/home-down.sh"
echo ""
echo "  Keep this Mac powered on. Tunnel dies if process stops."
