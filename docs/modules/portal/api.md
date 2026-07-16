# Portal — API (OpenAPI edge)

**Spec file:** `portal/openapi/openapi.yaml`  
**Version:** 1.0.0  
**Base:** `/v1`  
**Servers (examples):** `http://localhost:3001/v1`, production host as configured  

---

## Design principles

1. Edge contract for institutions — **not** the full core surface.  
2. All economic cycles enter **core Orchestrator**.  
3. AST **never** appraises assets; valuation is participant-provided.  
4. Security: Bearer session JWT **and/or** Mutual TLS (OpenAPI `securitySchemes`).  

---

## Endpoints

### `POST /tokenization/start`

Start primary tokenization process.

| | |
|--|--|
| operationId | `startTokenization` |
| Body | `StartTokenizationRequest` (includes **idempotencyKey**, institutional valuation, currency, asset type, holder, institution fields as schema defines) |
| 201 | `ProcessResponse` — process created (StartProcess) |
| 400 | Bad request |
| 401 / 403 | AuthZ |
| 409 | Idempotency key conflict (strict policy) |

Maps to Orchestrator `startProcess` / `POST .../core/processes/start`.

---

### `POST /documents/upload`

Upload document with **mandatory** qualified e-signature.

| | |
|--|--|
| operationId | `uploadDocument` |
| Content-Type | `multipart/form-data` |
| Required parts | `file`, `processId`, `signature` |
| Optional | `signatureAlgorithm` |
| 200 | `DocumentUploadResponse` — accepted for validation |
| 400 | Invalid signature or payload |
| 422 | Validation rules rejected document |

See [digital-signature.md](./digital-signature.md).

---

### `GET /processes/{processId}`

Process status (**own processes only**).

| | |
|--|--|
| operationId | `getProcess` |
| 200 | `ProcessResponse` |
| 404 | Not found or not owned |

processId pattern: `AST-{INST}-{YYYYMMDD}-<UUIDv7>` (string with description; not bare UUID format alone).

---

### `GET /assets`

List tokenized assets for current institution.

| | |
|--|--|
| operationId | `listAssets` |
| 200 | Array of `AssetSummary` |

---

### `GET /assets/{claimId}`

Asset detail (**own only**).

| | |
|--|--|
| operationId | `getAsset` |
| 200 | `AssetDetail` |
| 404 | Not found or not owned |

---

### `GET /health`

Liveness (typically unauthenticated).

| | |
|--|--|
| operationId | `health` |
| security | `[]` |
| 200 | OK |

---

## Process response model (portal)

Status subset for UI:

| Status | Meaning |
|--------|---------|
| `created` | StartProcess done |
| `documents_pending` | Awaiting valid signed docs |
| `validating` | Document/signature validation |
| `pot_pending` | PoT evaluation |
| `settling` | Emission/settlement |
| `completed` | Success |
| `failed` | Terminal fail |
| `expired` | Timeout / oracle fail-closed |

---

## Security schemes

| Scheme | Role |
|--------|------|
| `BearerAuth` | Session JWT after login |
| `MutualTLS` | Institutional certificate channel |

Critical institutional actions should remain bound to cert identity even when JWT is present.

---

## Core API (not Portal OpenAPI)

For internal/automation:

| Core | Role |
|------|------|
| `POST /v1/core/processes/start` | Direct orchestrator start |
| `GET /v1/core/processes/:processId` | Snapshot |
| `POST /v1/core/processes/:processId/run-pot` | Controlled continue from PoT |
| `POST /v1/core/partial-release` | Partial release process |

Portal product clients use **Portal** paths; core paths are for trusted core clients and ops tools.

Full field schemas: maintain and generate from `portal/openapi/openapi.yaml`.  
