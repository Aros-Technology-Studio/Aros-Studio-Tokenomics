#!/bin/bash
# SessionStart hook: prepare the Node environment for Claude Code on the web
# so build / lint / tests / canon gate run out of the box.
set -euo pipefail

# Only needed in the remote (web) environment; local checkouts manage their own deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Idempotent: npm install is a no-op when node_modules already matches,
# and benefits from the cached container state.
npm install --no-audit --no-fund
