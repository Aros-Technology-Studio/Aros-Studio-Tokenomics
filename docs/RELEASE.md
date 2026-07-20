# AST Release v1.1.0 — Production portal (no demo)

**Status:** Real operational release  
**Date:** 2026-07-20  
**Tag:** `v1.1.0`

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

```bash
bash scripts/release-check.sh
```

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
