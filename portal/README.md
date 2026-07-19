# AST Institutional Portal

Production-oriented **edge** for institutional clients: login, document hashing, primary tokenization submit, process status.

## Canon boundary

| Portal does | Portal does not |
|-------------|-----------------|
| Authenticate allowlisted institutions | Mint / burn ARO |
| Collect valuation + document package hash + КЭП flag | Bypass PoT / NodeChain |
| Hand off to Core Orchestrator | Hold third-party funds |
| Show process status from Core | All-Seeing Eye veto |

## Run (3 terminals)

```bash
# 1) Core
cd /path/to/Aros-Studio-Tokenomics
PORT=3000 npm run start:dev

# 2) Portal edge API
CORE_API_URL=http://localhost:3000 \
AST_INSTITUTION_TOKEN=demo-institution-token \
PORTAL_PORT=3100 \
npm --prefix portal/backend run start:dev

# 3) Portal UI
NEXT_PUBLIC_PORTAL_API_URL=http://localhost:3100 \
npm --prefix portal/frontend run dev
# → http://localhost:3200
```

### Dev login

| Field | Value |
|-------|--------|
| Institution | `DEMO` |
| Token | `demo-institution-token` |

Also available: `ACME` / `acme-institution-token`.

## API (edge)

| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/auth/institutions` | public |
| POST | `/v1/auth/login` | public |
| GET | `/v1/auth/me` | `X-Session-Id` |
| POST | `/v1/documents/hash` | session |
| GET | `/v1/processes` | session — list |
| POST | `/v1/processes` | session + `Idempotency-Key` |
| GET | `/v1/processes/:id` | session |

## UI routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/login` | Institution login |
| `/dashboard` | Process list |
| `/processes/new` | Primary tokenization wizard |
| `/processes/[id]` | Status (edge + core) |

## Tests

```bash
npm --prefix portal/shared test
npm --prefix portal/backend test
```

Architecture: [`docs/portal/ARCHITECTURE.md`](../docs/portal/ARCHITECTURE.md)
