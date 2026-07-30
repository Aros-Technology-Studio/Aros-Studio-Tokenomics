# AST Release v1.1.0 — Production portal (no demo)

**Status:** Real operational release  
**Date:** 2026-07-20  
**Tag:** `v1.1.0`  
**Field go-live (after A–I engineering):** see [`GO-LIVE-F1.md`](GO-LIVE-F1.md) · [`FIELD-RELEASE-F4.md`](FIELD-RELEASE-F4.md)

## What “real” means

| Item | Production |
|------|------------|
| Demo institutions DEMO/ACME | **Off** (`AST_ALLOW_DEMO=0`, `NODE_ENV=production`) |
| Institution credentials | **Only** `AST_INSTITUTION_SECRETS_JSON` |
| Core institution auth | `AST_REQUIRE_INSTITUTION_AUTH=1` |
| Login form | Empty — operator-issued credentials |
| Public site / explorer | On (no secrets) |
| Mint on portal | **Never** |

## Components

| Service | Image / path | Port |
|---------|--------------|------|
| Core | `ast-core` | 3000 |
| Portal edge | `ast-portal-edge` | 3100 |
| Portal UI | `ast-portal-ui` | 3200 |

## Production run

```bash
cp .env.production.example .env.production
# edit: AST_INSTITUTION_SECRETS_JSON, AST_INSTITUTION_TOKEN, NEXT_PUBLIC_PORTAL_API_URL

docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

### Institution secrets format

```json
[
  {
    "institutionId": "YOURBANK",
    "displayName": "Your Bank",
    "token": "long-random-secret",
    "allowlisted": true
  }
]
```

### Local production-mode without Docker

```bash
# Core
NODE_ENV=production \
AST_REQUIRE_INSTITUTION_AUTH=1 \
AST_INSTITUTION_TOKEN='…' \
PORT=3000 npm start

# Edge
NODE_ENV=production \
AST_ALLOW_DEMO=0 \
AST_INSTITUTION_SECRETS_JSON='[…]' \
CORE_API_URL=http://127.0.0.1:3000 \
PORTAL_PORT=3100 \
npm --prefix portal/backend run start:dev

# UI
NEXT_PUBLIC_PORTAL_API_URL=http://127.0.0.1:3100 \
npm --prefix portal/frontend run build && npm --prefix portal/frontend start
```

## Pre-release check

One gate for **core + portal** tests and production builds:

```bash
npm run check:release
# same as: bash scripts/release-check.sh
# alias:   npm run test:all
```

| Step | What runs |
|------|-----------|
| Core tests | `npm test` (Jest) |
| Portal shared | `npm --prefix portal/shared test` |
| Portal edge | `npm --prefix portal/backend test` |
| Builds | portal edge, portal UI (Next), core `tsc` |

Optional env:

| Var | Effect |
|-----|--------|
| `SKIP_FRONTEND_BUILD=1` | Skip Next.js build (faster local loop) |
| `SKIP_INSTALL=1` | Assume `node_modules` already installed (CI) |

CI runs the same gate via `npm run check:release` (see `.github/workflows/ci.yml`).

### Operator smoke (C5)

```bash
npm run smoke:operator
# expect: SMOKE PASS (C5)
```

Covers Orchestrator primary path, Oracle M-of-N + fail-closed, Release I8 gate + daemon tick, Partial release.  
Checklist: `docs/OPERATOR-SMOKE-C5.md`. Included in `npm run check:release`.

### Contracts (Foundry)

```bash
brew install foundry   # once
npm run test:contracts # forge test --root contracts
```

CI job `contracts` installs Foundry and runs `forge test` under `contracts/`.  
`check:release` runs forge tests when `forge` is on `PATH` (skips with a note otherwise).

### Rust companion

```bash
# once
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# from repo root (not ~)
cd /path/to/Aros-Studio-Tokenomics
npm run test:rust
```

CI job `rust` runs `cargo test --workspace` under `rust/`.  
`check:release` sources `$HOME/.cargo/env` when present and runs cargo if available.

## Dev-only demo (not production)

```bash
AST_ALLOW_DEMO=1 NODE_ENV=development …
# DEMO / demo-institution-token
```

## Domain

`arosfinancialcore.com` A-records may point at home IP — TLS reverse proxy is operator responsibility (Namecheap DNS already can target host). This release does not require demo mode for that host.

## Out of scope (still)

- Full mTLS/OIDC (JWT schemes documented in OpenAPI as target)
- Full X.509 КЭП chain
- External security audit
