# Portal — backend (Portal API)

**Path:** `portal/backend/`  
**Stack:** NestJS + TypeScript  
**Global prefix:** `/v1`  
**OpenAPI:** `portal/openapi/openapi.yaml`  
**Shared types:** `portal/shared`

---

## Purpose

Portal API is the **edge orchestrator client** for browser and institutional integrations that should not speak raw core internals.

Responsibilities:

- Authenticate institutional sessions (mTLS + cert → short-lived session JWT)
- Accept document uploads with **mandatory** qualified signature verification at the edge
- Start processes by calling **core Orchestrator** only
- Project process/asset reads with **own-only** filtering
- Health / liveness for edge ops

Non-responsibilities:

- PoT quorum evaluation  
- Emission math / mint  
- NodeChain durable SoT writes (core owns)  
- Inventing valuations  

---

## System position

```text
[portal/frontend]
       │  HTTPS JSON / multipart
       ▼
[portal/backend]  NestJS  /v1
       │  internal trusted calls
       ▼
[core Orchestrator]  src/orchestrator + src/core-api
       │
       ▼
  pot / nodechain / emission / …
```

**Forbidden:** Portal API handlers that call `aroscoin.mint`, `commission.settle`, or `pot.verify` as a substitute for a full Orchestrator process.

---

## Auth model

| Layer | Mechanism |
|-------|-----------|
| Transport | mTLS + institutional certificate |
| Browser session | Short-lived **session JWT** after login |
| Node edge auth | Not this JWT — nodes use mTLS + signed challenges separately |

JWT is **session convenience for the portal**, not a replacement for institutional cert identity on critical actions.

---

## Handler classes (logical)

| Area | Behavior |
|------|----------|
| Tokenization start | Validate body → require idempotencyKey → `Orchestrator.startProcess` (or core HTTP) |
| Document upload | Multipart file + processId + signature → verify КЭП → attach to process |
| Process get | Own-only; map core snapshot to portal DTO |
| Assets list/detail | Own-only claims projection |
| Health | No auth; liveness |

---

## processId handling

Portal never invents free-form process ids for economic start. Core returns:

```text
AST-{INST}-{YYYYMMDD}-<UUIDv7>
```

OpenAPI documents processId as `string` with pattern description (not bare `format: uuid` alone).

---

## Error mapping

| Core / validation condition | Portal response |
|----------------------------|-----------------|
| Validation | 400 |
| Unauthenticated | 401 |
| Wrong institution / forbidden | 403 |
| Idempotency conflict (if strict) | 409 |
| Invalid signature | 400 / 422 |
| Not found or not owned | 404 |
| Core fail-closed / expired | Reflect process status; do not soft-mint |

---

## Configuration

| Concern | Notes |
|---------|--------|
| Core base URL | Internal network only |
| Cert trust store | Institutional CA / allowlist alignment with `nodes` |
| Session TTL | Short-lived |
| Environments | local / test / sandbox / prod |

---

## Security notes

- Encrypt sensitive document payloads at rest per core/nodechain rules when stored  
- Do not log full signature material or private keys  
- Rate-limit start and upload endpoints per institution  
- Concurrent process limit is enforced in Orchestrator (10); Portal should surface the error clearly  

---

## Relation to core-api

`src/core-api/` is the Nest surface on the **core** service. Portal backend is a **separate edge process** that calls into core. In local monorepo they may be composed carefully, but product architecture treats them as edge vs core.

See [api.md](./api.md) for the external OpenAPI contract.  
