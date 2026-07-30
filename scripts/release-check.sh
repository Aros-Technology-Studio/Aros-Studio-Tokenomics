#!/usr/bin/env bash
# Pre-release verification: core + portal tests and production builds in one gate.
# Usage:
#   bash scripts/release-check.sh
#   npm run check:release
#
# Env:
#   SKIP_FRONTEND_BUILD=1  — skip Next.js build (faster local loop)
#   SKIP_INSTALL=1         — do not npm ci (deps already present)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

step() { echo ""; echo "==> $*"; }

ensure_ci() {
  local dir="$1"
  if [[ "${SKIP_INSTALL:-}" == "1" ]]; then
    return 0
  fi
  if [[ ! -d "$dir/node_modules" ]]; then
    step "Install dependencies ($dir)"
    if [[ -f "$dir/package-lock.json" ]]; then
      npm ci --prefix "$dir"
    else
      npm install --prefix "$dir"
    fi
  fi
}

# Root (core)
if [[ "${SKIP_INSTALL:-}" != "1" && ! -d node_modules ]]; then
  step "Install dependencies (core)"
  npm ci
fi

ensure_ci portal/shared
ensure_ci portal/backend
if [[ "${SKIP_FRONTEND_BUILD:-}" != "1" ]]; then
  ensure_ci portal/frontend
fi

step "Core tests"
npm test

step "Operator smoke (C5: orchestrator · oracle · release · partial-release)"
npm run smoke:operator

step "Portal shared tests"
npm --prefix portal/shared test

step "Portal backend (edge) tests"
AST_ALLOW_DEMO=1 NODE_ENV=test npm --prefix portal/backend test

step "Portal backend build"
npm --prefix portal/backend run build

if [[ "${SKIP_FRONTEND_BUILD:-}" == "1" ]]; then
  step "Portal frontend build (skipped — SKIP_FRONTEND_BUILD=1)"
else
  step "Portal frontend build"
  npm --prefix portal/frontend run build
fi

step "Core production build"
npm run build

if command -v forge >/dev/null 2>&1; then
  step "Forge tests (contracts representation)"
  forge test --root contracts -vv
else
  step "Forge tests (skipped — install: brew install foundry)"
fi

# cargo often lives only after: source "$HOME/.cargo/env"
if [[ -f "$HOME/.cargo/env" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
fi
if command -v cargo >/dev/null 2>&1; then
  step "Rust companion tests"
  cargo test --manifest-path rust/Cargo.toml --workspace
else
  step "Rust tests (skipped — install: curl https://sh.rustup.rs | sh)"
fi

extras=""
command -v forge >/dev/null 2>&1 && extras+=" + forge"
command -v cargo >/dev/null 2>&1 && extras+=" + cargo"
echo ""
echo "Release check OK (core + portal + builds${extras})"
