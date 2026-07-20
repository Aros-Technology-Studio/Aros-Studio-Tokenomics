# Aros Financial Core — Institutional Portal

Product **edge UI + BFF** for institutional clients.

## Structure

See [`docs/portal/STRUCTURE.md`](../docs/portal/STRUCTURE.md) for the target tree and Canon map.

```
portal/
├── frontend/     # Next.js App Router — (auth), (dashboard), components, lib, types
├── backend/      # NestJS — src/modules/{auth,processes,documents,assets,health,tokenization}
├── shared/       # admission validation + processId helpers
└── openapi/
```

## Routes (UI)

| Path | Page |
|------|------|
| `/` | Landing |
| `/login` | Institution login |
| `/dashboard` | KPIs + process table |
| `/tokenization` | New primary package (wizard) |
| `/tokenization/[processId]` | Status pipeline |
| `/assets` | Claims list (read-only) |
| `/assets/[claimId]` | Claim detail |
| `/history` | Submission history |

## Edge API

| Method | Path |
|--------|------|
| POST | `/v1/auth/login` |
| GET | `/v1/processes`, `/v1/processes/stats`, `/v1/processes/:id` |
| POST | `/v1/processes` |
| POST | `/v1/documents/hash` |
| GET | `/v1/assets`, `/v1/assets/:claimId` |
| GET | `/v1/health`, `/v1/health/ready` |

**No mint on edge.** Core remains SoT after hand-off.

## Run

```bash
# Core :3000, edge :3100, UI :3200
bash scripts/home-up.sh
# or see portal package scripts / docker compose
```

**Demo login:** `DEMO` / `demo-institution-token`
