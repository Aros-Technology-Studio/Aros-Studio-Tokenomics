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
# Default pilot journal (stable keys under this dir). Override if needed.
export AST_JOURNAL_DIR="${AST_JOURNAL_DIR:-$ROOT/data/journal-pilot}"
export AST_REQUIRE_CRYPTO="${AST_REQUIRE_CRYPTO:-0}"
export AST_KEY_PROVIDER="${AST_KEY_PROVIDER:-file}"
export AST_INSTITUTION_TOKEN="${AST_INSTITUTION_TOKEN:-}"
export AST_INSTITUTION_SECRETS_JSON="${AST_INSTITUTION_SECRETS_JSON:-}"
export AST_ALLOW_DEMO="${AST_ALLOW_DEMO:-1}"
export NODE_ENV="${NODE_ENV:-development}"
export KILL_SWITCH="${KILL_SWITCH:-false}"
export AST_PILOT_SALT="${AST_PILOT_SALT:-pilot}"
export PORT="${PORT:-3000}"
export PORTAL_PORT="${PORTAL_PORT:-3100}"
export CORE_API_URL="${CORE_API_URL:-http://127.0.0.1:3000}"
export PORTAL_CORE_HANDOFF="${PORTAL_CORE_HANDOFF:-true}"
export NEXT_PUBLIC_PORTAL_API_URL="${NEXT_PUBLIC_PORTAL_API_URL:-}"
export PORTAL_EDGE_URL="${PORTAL_EDGE_URL:-http://127.0.0.1:3100}"
export AST_EDGE_STORE_PATH="${AST_EDGE_STORE_PATH:-$ROOT/data/edge-processes.json}"
# Real institutions: file preferred over shell JSON
export AST_INSTITUTION_SECRETS_FILE="${AST_INSTITUTION_SECRETS_FILE:-$ROOT/data/institution-secrets.json}"
if [[ -f "$AST_INSTITUTION_SECRETS_FILE" ]]; then
  # Secrets file present — keep PILOT for login; demo optional
  export AST_ALLOW_DEMO="${AST_ALLOW_DEMO:-1}"
  echo "==> Using institution secrets: $AST_INSTITUTION_SECRETS_FILE"
  echo "    AST_ALLOW_DEMO=$AST_ALLOW_DEMO (login pilot / salt pilot)"
else
  unset AST_INSTITUTION_SECRETS_FILE
  export AST_ALLOW_DEMO="${AST_ALLOW_DEMO:-1}"
fi

mkdir -p "$AST_JOURNAL_DIR" "$(dirname "$AST_EDGE_STORE_PATH")"

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
        pkill -P "$pid" 2>/dev/null || true
      fi
      rm -f "$LOG_DIR/$f.pid"
    fi
  done
}
stop_pids

# Free stuck ports
for port in "$PORT" "$PORTAL_PORT" 3200; do
  pids="$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids:-}" ]]; then
    echo "==> Freeing :$port"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 0.5
  fi
done

echo "==> Starting Core :$PORT"
nohup env PORT="$PORT" \
  NODE_ENV="$NODE_ENV" \
  AST_JOURNAL_ENGINE="$AST_JOURNAL_ENGINE" \
  AST_JOURNAL_DIR="$AST_JOURNAL_DIR" \
  AST_KEY_PROVIDER="$AST_KEY_PROVIDER" \
  AST_INSTITUTION_TOKEN="$AST_INSTITUTION_TOKEN" \
  AST_INSTITUTION_SECRETS_JSON="${AST_INSTITUTION_SECRETS_JSON:-}" \
  AST_INSTITUTION_SECRETS_FILE="${AST_INSTITUTION_SECRETS_FILE:-}" \
  AST_PILOT_SALT="${AST_PILOT_SALT:-pilot}" \
  KILL_SWITCH="$KILL_SWITCH" \
  node dist/src/main.js >"$LOG_DIR/core.log" 2>&1 &
echo $! >"$LOG_DIR/core.pid"

echo "==> Starting Portal edge :$PORTAL_PORT"
nohup env PORTAL_PORT="$PORTAL_PORT" \
  PORT="$PORTAL_PORT" \
  NODE_ENV="$NODE_ENV" \
  AST_ALLOW_DEMO="$AST_ALLOW_DEMO" \
  CORE_API_URL="$CORE_API_URL" \
  PORTAL_CORE_HANDOFF="$PORTAL_CORE_HANDOFF" \
  AST_INSTITUTION_TOKEN="$AST_INSTITUTION_TOKEN" \
  AST_INSTITUTION_SECRETS_JSON="${AST_INSTITUTION_SECRETS_JSON:-}" \
  AST_INSTITUTION_SECRETS_FILE="${AST_INSTITUTION_SECRETS_FILE:-}" \
  AST_EDGE_STORE_PATH="$AST_EDGE_STORE_PATH" \
  npm --prefix portal/backend run start:dev >"$LOG_DIR/edge.log" 2>&1 &
echo $! >"$LOG_DIR/edge.pid"

echo "==> Starting Portal UI :3200 (same-origin /v1 → edge)"
nohup env PORT=3200 \
  NEXT_PUBLIC_PORTAL_API_URL="" \
  PORTAL_EDGE_URL="$PORTAL_EDGE_URL" \
  npm --prefix portal/frontend run dev >"$LOG_DIR/ui.log" 2>&1 &
echo $! >"$LOG_DIR/ui.pid"

wait_http() {
  local url="$1" name="$2" n=0
  until curl -sf -m 2 "$url" >/dev/null 2>&1; do
    n=$((n + 1))
    if [[ $n -ge 40 ]]; then
      echo "ERROR: $name not ready ($url) — see $LOG_DIR"
      return 1
    fi
    sleep 0.5
  done
  echo "  OK $name"
}

echo "==> Waiting for health"
wait_http "http://127.0.0.1:${PORT}/health" "Core"
wait_http "http://127.0.0.1:${PORTAL_PORT}/v1/health" "Portal edge"
wait_http "http://127.0.0.1:3200/" "Portal UI" || wait_http "http://127.0.0.1:3200/login" "Portal UI login"

echo ""
echo "AST home stack is up."
echo "  Local UI:  http://127.0.0.1:3200"
echo "  LAN UI:    http://${LAN_IP}:3200"
echo "  Login:     http://127.0.0.1:3200/login"
echo "  Wizard:    http://127.0.0.1:3200/tokenization  (document-first)"
echo "  Core:      http://127.0.0.1:${PORT}/health"
echo "  Edge:      http://127.0.0.1:${PORTAL_PORT}/v1/health"
echo ""
if [[ -f "${AST_INSTITUTION_SECRETS_FILE:-}" ]]; then
  echo "  Login: use institution from data/institution-credentials.txt"
  echo "         (generated by scripts/setup-institution-secrets.sh)"
else
  echo "  Demo login (local):"
  echo "    Institution: DEMO"
  echo "    Token:       demo-institution-token"
  echo "  Real pilot secrets:"
  echo "    bash scripts/setup-institution-secrets.sh --id PILOT --name \"Pilot Institution\""
fi
echo ""
echo "  Edge store: $AST_EDGE_STORE_PATH"
echo "  Logs:       $LOG_DIR/*.log"
echo "  Stop:       bash scripts/home-down.sh"
echo ""
echo "Public tunnel (optional): bash scripts/home-tunnel.sh"
