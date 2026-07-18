# Institutional Portal (edge)

Scaffold for the **institutional submission edge**: Next.js UI + Nest BFF + shared types + OpenAPI.

## Canon boundary

- Portal **does not mint** and is **not** NodeChain SoT.
- Requires **institutional valuation** (decimal string) and **qualified signature**.
- `processId`: `AST-{INST}-{YYYYMMDD}-{suffix}` (aligned with Core Orchestrator).
- `Idempotency-Key` **mandatory** on mutating calls.

Architecture: [`docs/portal/ARCHITECTURE.md`](../docs/portal/ARCHITECTURE.md)  
OpenAPI: [`openapi/openapi.yaml`](./openapi/openapi.yaml)

## Layout

```
portal/
  openapi/openapi.yaml
  shared/     processId, idempotency, admission validate
  backend/    Nest edge API (port 3100)
  frontend/   Next.js UI (port 3000)
```

## Local run

```bash
# shared + backend tests (Node built-in test runner)
cd portal/shared && npm i && npm test
cd ../backend && npm i && npm test && npm run start:dev

# frontend (separate terminal)
cd portal/frontend && npm i && npm run dev
```

Env:

| Variable | Default | Meaning |
|----------|---------|---------|
| `PORTAL_PORT` | `3100` | Nest edge port |
| `NEXT_PUBLIC_PORTAL_API_URL` | `http://localhost:3100` | Browser → edge API |

## Stub vs Core

`coreHandOff: stub` — submissions stay in edge memory. Wiring to `TokenizationPipeline` is a follow-on; economic emission remains Core-only after PoT.
