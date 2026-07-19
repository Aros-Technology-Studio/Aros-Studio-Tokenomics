#!/usr/bin/env bash
# Expose home Portal UI to the internet via Cloudflare quick tunnel (no domain).
# Prerequisite: stack running (scripts/home-up.sh) and cloudflared installed.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${AST_HOME_LOG_DIR:-$ROOT/.home-run}"
mkdir -p "$LOG_DIR"
UI_URL="${AST_HOME_UI_URL:-http://127.0.0.1:3200}"

ROOT_BIN="$ROOT/.home-run/bin"
CLOUDFLARED="$(command -v cloudflared 2>/dev/null || true)"
if [[ -z "$CLOUDFLARED" && -x "$ROOT_BIN/cloudflared" ]]; then
  CLOUDFLARED="$ROOT_BIN/cloudflared"
fi
if [[ -z "$CLOUDFLARED" ]]; then
  echo "cloudflared not found — downloading official binary..."
  mkdir -p "$ROOT_BIN"
  ARCH="$(uname -m)"
  if [[ "$ARCH" == "arm64" ]]; then
    CF_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
  else
    CF_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
  fi
  curl -fsSL -o /tmp/cloudflared.tgz "$CF_URL"
  tar -xzf /tmp/cloudflared.tgz -C "$ROOT_BIN"
  chmod +x "$ROOT_BIN/cloudflared"
  CLOUDFLARED="$ROOT_BIN/cloudflared"
fi

# health wait
for i in $(seq 1 30); do
  if curl -sf "$UI_URL" >/dev/null 2>&1; then break; fi
  sleep 1
done

if [[ -f "$LOG_DIR/tunnel.pid" ]]; then
  old="$(cat "$LOG_DIR/tunnel.pid")"
  kill "$old" 2>/dev/null || true
  rm -f "$LOG_DIR/tunnel.pid"
fi

echo "==> Starting Cloudflare quick tunnel → $UI_URL"
# quick tunnel prints https://*.trycloudflare.com
nohup "$CLOUDFLARED" tunnel --url "$UI_URL" --no-autoupdate >"$LOG_DIR/tunnel.log" 2>&1 &
echo $! >"$LOG_DIR/tunnel.pid"

echo "Waiting for public URL..."
PUBLIC=""
for i in $(seq 1 40); do
  PUBLIC="$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null | head -1 || true)"
  if [[ -n "$PUBLIC" ]]; then break; fi
  sleep 0.5
done

if [[ -z "$PUBLIC" ]]; then
  echo "Tunnel started but URL not parsed yet. Check: tail -f $LOG_DIR/tunnel.log"
  exit 0
fi

echo "$PUBLIC" >"$LOG_DIR/public-url.txt"
echo ""
echo "========================================"
echo "  HOME PUBLIC URL (through your house):"
echo "  $PUBLIC"
echo "========================================"
echo "  Login: DEMO / demo-institution-token"
echo "  Stop tunnel: bash scripts/home-down.sh"
echo "  URL file: $LOG_DIR/public-url.txt"
