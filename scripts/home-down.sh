#!/usr/bin/env bash
# Stop AST home stack + optional tunnel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${AST_HOME_LOG_DIR:-$ROOT/.home-run}"

for f in core edge ui tunnel; do
  if [[ -f "$LOG_DIR/$f.pid" ]]; then
    pid="$(cat "$LOG_DIR/$f.pid" || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping $f (pid $pid)"
      kill "$pid" 2>/dev/null || true
      # child process groups (npm/tsx)
      pkill -P "$pid" 2>/dev/null || true
    fi
    rm -f "$LOG_DIR/$f.pid"
  fi
done

# Best-effort free ports if leftovers
for port in 3000 3100 3200; do
  pids="$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids:-}" ]]; then
    echo "Freeing :$port ($pids)"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
  fi
done

echo "Home stack stopped."
