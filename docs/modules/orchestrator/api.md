# Orchestrator — API surface

**Module:** `orchestrator`  
**Core HTTP:** `src/core-api/core-process.controller.ts` (prefix under app global routing)  
**Service:** `src/orchestrator/orchestrator.service.ts`  
**Portal edge:** calls this path only for economic actions (see `docs/modules/portal/api.md`)

---

## Design rules

1. **Sole economic entry** — external clients (Portal, CLI, internal jobs) start cycles here; they do not call `emission`, `aroscoin.mint`, or `commission` as public side doors.  
2. **Business truth** remains NodeChain; HTTP responses are conveniences.  
3. **`idempotencyKey` required** on start.  
4. **processId** is never a bare UUID-only product id.

---

## processId

```text
AST-{INST}-{YYYYMMDD}-<UUIDv7>
```

Built by `buildProcessId(institutionCode)` (common ids).

---

## Core process HTTP API (v1 shape)

Base (implementation): controller `@Controller('core/processes')` — resolve with application global prefix if any (e.g. `/v1/core/processes` when the app mounts `/v1`).

### `POST .../core/processes/start`

Start a primary economic process (tokenization path).

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `institutionCode` | string | yes | Min length 2; used in processId |
| `idempotencyKey` | string | yes | Min length 8; scoped with institution |
| `institutionalValuation` | string | yes | Institutional amount as decimal string — **not** AST-computed |
| `currency` | string | yes | Valuation currency code |
| `assetType` | string | yes | Process asset class / type |
| `holderId` | string | yes | Holder identity for claims |

**Success response (illustrative)**

```json
{
  "processId": "AST-ACME-20260716-<uuidv7>",
  "status": "documents_pending",
  "currentStep": "DocumentValidation",
  "createdAt": "2026-07-16T12:00:00.000Z"
}
```

**Errors**

| Condition | Behavior |
|-----------|----------|
| Missing/invalid fields | 400 validation |
| Concurrent ≥ 10 | Reject (structured AST error) |
| Kill switch | Reject new economic cause |
| Idempotent retry | 200/201-class return of existing process |

---

### `GET .../core/processes/:processId`

Return process snapshot for known id.

**Success — `ProcessSnapshot` fields**

| Field | Type | Notes |
|-------|------|-------|
| `processId` | string | Canonical id |
| `status` | enum | `created` \| `documents_pending` \| `validating` \| `pot_pending` \| `settling` \| `completed` \| `failed` \| `expired` |
| `step` | PipelineStep | Current pipeline step name |
| `valuation` | string | Institutional valuation snapshot |
| `holderId` | string | |
| `claimId` | string? | After successful emission path |
| `verified` | 0 \| 1? | PoT result when known |
| `createdAt` | ISO-8601 UTC | |

**404** if process not found.

Ownership filtering for institutions is enforced at Portal edge and policy layers; core internal API may be broader for trusted roles.

---

### `POST .../core/processes/:processId/run-pot`

Drive PoT evaluation and subsequent pipeline from PoT (internal/test and controlled automation path).

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `criteria` | CriteriaResult | yes | P1–P4 structure |
| `nodeWeights` | Record\<string, string\> | no | Defaults may apply for sandbox |

**Behavior**

- Coordinates PoT → NodeChain → Emission → Settlement → State → End as implemented in `runFromPot`  
- Respects fail-closed and compensation rules  
- Not a public “mint button” — still full process discipline  

---

## Related core API: partial release

Separate controller: `src/core-api/core-partial-release.controller.ts`

| Method | Path (typical) | Role |
|--------|----------------|------|
| `POST` | `/v1/core/partial-release` | Start partial-release **full process** via Orchestrator discipline |

Partial release is **not** Release Phase activation. See `docs/modules/release/partial-release.md`.

---

## Service-level operations (non-HTTP)

| Operation | Role |
|-----------|------|
| `startProcess(input)` | Sole create + idempotency + concurrency |
| `getProcess(processId)` | Snapshot read |
| `runFromPot(...)` | Continue economic path after criteria ready |
| Oracle integration | `OracleGatewayService.requireOk` / submit when step required |

Internal module calls from Orchestrator only (ModuleRef resolution to pot, emission, aroscoin, commission, reserve, nodechain, oracle-gateway, state-recording, kill-switch).

---

## Events (out)

| Event | Meaning |
|-------|---------|
| `ProcessStarted` | processId created |
| `ProcessStepCompleted` | step N done |
| `ProcessCompensating` | saga reverse |
| `ProcessFailed` | terminal fail |
| `ProcessEnded` | success terminal |

Eye may observe these; Eye does not emit executive commands.

---

## Forbidden API patterns

| Pattern | Why forbidden |
|---------|----------------|
| Public `POST /mint` bypassing process | Violates sole entry + PoT |
| Public `POST /settle` without process | Settlement only post-factum on process |
| Client-supplied arbitrary processId at start without StartProcess | processId mint is Orchestrator-owned |
| Soft-continue after oracle fail | Fail-closed → expired |
| Compensate after `verified = 1` via API flag | Canon forbids |

---

## Portal mapping

| Portal endpoint | Core mapping |
|-----------------|--------------|
| `POST /v1/tokenization/start` | Orchestrator `startProcess` |
| `POST /v1/documents/upload` | Feeds document step; then pipeline continues |
| `GET /v1/processes/{processId}` | Process status projection (own only) |

Portal never implements PoT/emission; it is an edge client. Full OpenAPI: `portal/openapi/openapi.yaml`.

---

## CLI / ops

Smoke path (repo): `npm run cli tokenize` (or project CLI equivalent under `scripts/ast-cli.ts`) — must still enter via Orchestrator semantics.

---

## Error codes

Use shared `AstError` / `AstErrorCode` (`src/common/errors/`). Documented module reason codes for oracle and Eye (e.g. `ORACLE_QUORUM_FAILED`, `E_INVARIANT_BROKEN`) appear on fail paths and observations; they do not authorize Eye to stop writes.  
