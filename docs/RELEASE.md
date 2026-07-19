# AST Release v1.0.0

**Status:** First public release  
**Date:** 2026-07-19  
**Scope:** Core economic path + institutional portal edge

## What ships

| Component | Role | Port |
|-----------|------|------|
| **Core** | NestJS NodeChain SoT, Orchestrator, PoT, mint path | 3000 |
| **Portal edge** | Institution auth, document hash, Core hand-off | 3100 |
| **Portal UI** | Institutional client web app | 3200 |

**Portal does not mint.** Core remains SoT after hand-off.

## Run (Docker Compose)

```bash
git clone https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics.git
cd Aros-Studio-Tokenomics
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:3200 | Portal UI |
| http://localhost:3100/v1/health | Portal edge |
| http://localhost:3000/health | Core |

### Dev login (demo)

| Field | Value |
|-------|--------|
| Institution | `DEMO` |
| Token | `demo-institution-token` |

Override: `AST_INSTITUTION_TOKEN=... docker compose up`

## Run (local, no Docker)

```bash
# Core
PORT=3000 npm install && npm run build && npm start

# Portal edge
CORE_API_URL=http://localhost:3000 \
AST_INSTITUTION_TOKEN=demo-institution-token \
PORTAL_PORT=3100 \
npm --prefix portal/backend ci && npm --prefix portal/backend run start:dev

# Portal UI
NEXT_PUBLIC_PORTAL_API_URL=http://localhost:3100 \
npm --prefix portal/frontend ci && npm --prefix portal/frontend run dev
```

## Container images (GHCR)

On tag `v*`, GitHub Actions publishes:

- `ghcr.io/aros-technology-studio/ast-core`
- `ghcr.io/aros-technology-studio/ast-portal-edge`
- `ghcr.io/aros-technology-studio/ast-portal-ui`

## Out of scope (v1.0)

- Production mTLS / OIDC
- Full X.509 КЭП chain
- External security audit
- Custom domain / multi-region

## Acceptance for this tag

- [x] Core tests green (Jest)
- [x] Portal backend + shared tests green
- [x] Portal UI production build
- [x] Dockerfiles for core + portal edge + UI
- [x] `docker compose` full stack
- [x] OpenAPI edge contract
