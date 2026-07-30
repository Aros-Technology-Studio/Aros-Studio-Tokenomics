#!/usr/bin/env bash
# Start AST at home: Core + Portal edge + Portal UI (same-origin API).
# Owner one-command start (D1) — no chat required after first clone.
# Usage: bash scripts/home-up.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG_DIR="${AST_HOME_LOG_DIR:-$ROOT/.home-run}"
mkdir -p "$LOG_DIR"
READY_FILE="$LOG_DIR/READY.txt"

# --- Preflight (fail early with clear message) ---
preflight() {
  if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: Node.js not found. Install Node 20+ (https://nodejs.org or: brew install node@20)"
    echo "  Then open a new terminal and run: bash scripts/home-up.sh"
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm not found (comes with Node.js)."
    exit 1
  fi
  local major
  major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
  if [[ "${major:-0}" -lt 20 ]]; then
    echo "ERROR: Node.js >= 20 required (found $(node -v 2>/dev/null || echo unknown))"
    exit 1
  fi
  if ! command -v curl >/dev/null 2>&1; then
    echo "ERROR: curl is required for health checks."
    exit 1
  fi
  echo "==> Preflight OK — node $(node -v) · npm $(npm -v | head -1)"
}

preflight

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo 127.0.0.1)"

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
  export AST_ALLOW_DEMO="${AST_ALLOW_DEMO:-1}"
  echo "==> Using institution secrets: $AST_INSTITUTION_SECRETS_FILE"
  echo "    AST_ALLOW_DEMO=$AST_ALLOW_DEMO"
else
  unset AST_INSTITUTION_SECRETS_FILE
  export AST_ALLOW_DEMO="${AST_ALLOW_DEMO:-1}"
fi

mkdir -p "$AST_JOURNAL_DIR" "$(dirname "$AST_EDGE_STORE_PATH")"

echo "==> Installing deps if needed (first run can take several minutes)"
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
  AST_JOURNAL_ENCRYPT="${AST_JOURNAL_ENCRYPT:-1}" \
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
  AST_PILOT_SALT="${AST_PILOT_SALT:-pilot}" \
  npm --prefix portal/backend run start:dev >"$LOG_DIR/edge.log" 2>&1 &
echo $! >"$LOG_DIR/edge.pid"

echo "==> Starting Portal UI :3200 (same-origin /v1 → edge)"
nohup env PORT=3200 \
  NEXT_PUBLIC_PORTAL_API_URL="" \
  PORTAL_EDGE_URL="$PORTAL_EDGE_URL" \
  npm --prefix portal/frontend run dev >"$LOG_DIR/ui.log" 2>&1 &
echo $! >"$LOG_DIR/ui.pid"

wait_http() {
  local url="$1" name="$2" loghint="$3" n=0
  until curl -sf -m 2 "$url" >/dev/null 2>&1; do
    n=$((n + 1))
    if [[ $n -ge 60 ]]; then
      echo ""
      echo "ERROR: $name not ready ($url)"
      echo "  Logs: $LOG_DIR"
      if [[ -n "$loghint" && -f "$loghint" ]]; then
        echo "  --- last 30 lines of $(basename "$loghint") ---"
        tail -n 30 "$loghint" || true
      fi
      echo ""
      echo "  Fix tips:"
      echo "    1) bash scripts/home-down.sh"
      echo "    2) Open $loghint and look for ERROR / EADDRINUSE"
      echo "    3) bash scripts/home-up.sh again"
      return 1
    fi
    sleep 0.5
  done
  echo "  OK $name"
}

echo "==> Waiting for health (up to ~30s each)"
wait_http "http://127.0.0.1:${PORT}/health" "Core" "$LOG_DIR/core.log"
wait_http "http://127.0.0.1:${PORTAL_PORT}/v1/health" "Portal edge" "$LOG_DIR/edge.log"
wait_http "http://127.0.0.1:3200/" "Portal UI" "$LOG_DIR/ui.log" \
  || wait_http "http://127.0.0.1:3200/login" "Portal UI login" "$LOG_DIR/ui.log"

# Ready card for owner (no chat needed next time)
{
  echo "AST home stack — READY"
  echo "Generated: $(date -u +%Y-%m-%dT%H:%MZ)"
  echo ""
  echo "OPEN IN BROWSER"
  echo "  Local:  http://127.0.0.1:3200"
  echo "  LAN:    http://${LAN_IP}:3200"
  echo "  Login:  http://127.0.0.1:3200/login"
  echo "  Wizard: http://127.0.0.1:3200/tokenization"
  echo "  Journal:http://127.0.0.1:3200/nodechain"
  echo ""
  echo "LOGIN (local demo — AST_ALLOW_DEMO=$AST_ALLOW_DEMO)"
  echo "  Quick:  login pilot  ·  salt pilot"
  echo "  Alt:    Institution DEMO  ·  Token demo-institution-token"
  if [[ -f "${AST_INSTITUTION_SECRETS_FILE:-}" ]]; then
    echo "  File:   $AST_INSTITUTION_SECRETS_FILE"
    echo "          (see data/institution-credentials.txt if present)"
  fi
  echo ""
  echo "HEALTH"
  echo "  Core:  http://127.0.0.1:${PORT}/health"
  echo "  Edge:  http://127.0.0.1:${PORTAL_PORT}/v1/health"
  echo ""
  echo "STOP"
  echo "  bash scripts/home-down.sh"
  echo "  or: npm run home:down"
  echo ""
  echo "PUBLIC TUNNEL (optional)"
  echo "  bash scripts/home-tunnel.sh"
  echo ""
  echo "LOGS"
  echo "  $LOG_DIR/core.log"
  echo "  $LOG_DIR/edge.log"
  echo "  $LOG_DIR/ui.log"
  echo ""
  echo "DOCS"
  echo "  docs/OWNER-START-D1.md"
  echo "  docs/HOME-ACCESS.md"
} | tee "$READY_FILE"

echo ""
echo "Card also saved to: $READY_FILE"
echo "AST home stack is up. Open http://127.0.0.1:3200"
