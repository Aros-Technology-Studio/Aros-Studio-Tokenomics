# Oracle Gateway — API

**Service:** `OracleGatewayService`  
**Code:** `src/oracle-gateway/oracle-gateway.service.ts`  
**Pack CONTRACT:** `docs/components/oracle-gateway/CONTRACT.md`

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| `processId` | orchestrator | yes | Ties accept record |
| `attestations[]` | external oracles | yes | Each: oracleId, payload, signature, publicKey |
| `requiredCount` | config | yes | Default 2 |

### Attestation shape (logical)

```typescript
interface OracleAttestation {
  oracleId: string;
  payload: unknown;      // structured / JSON-serializable
  signature: string;     // base64 or stub digest
  publicKey: string;     // PEM or test material
}
```

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| `OracleGatewayResult.ok` | orchestrator | Gate |
| `acceptedCount` / `requiredCount` | orchestrator / audit | Metrics |
| `reasonCode` | orchestrator / Eye | e.g. `ORACLE_QUORUM_FAILED` |
| NodeChain record | nodechain | On **ok** only |

### Result shape

```typescript
interface OracleGatewayResult {
  ok: boolean;
  processId: string;
  acceptedCount: number;
  requiredCount: number;
  reasonCode?: string; // when !ok
}
```

---

## Methods

| Method | Behavior |
|--------|----------|
| `setRequiredCount(n)` | Sets quorum; clamps to `n ≥ 1` |
| `submit(processId, attestations)` | Verify + quorum + append on success; returns result |
| `requireOk(processId, attestations)` | Calls submit; if `!ok` throws fail-closed error (process expired path) |

### `requireOk` fail-closed

Implementation maps failure to `AstError` with expired-class code so Orchestrator expires the process rather than continuing to emission.

---

## NodeChain record (on accept)

| Field | Example |
|-------|---------|
| `writerRole` | `internal_service` |
| `processId` | binding id |
| `recordType` | `oracle_gateway_accepted` |
| `payload` | `{ oracleIds: string[], count: number }` |

Append failure after quorum → **fail closed** (do not return soft ok).

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| `acceptedCount < requiredCount` | `ok=false`; `ORACLE_QUORUM_FAILED` |
| Invalid signature | Attestation ignored |
| Duplicate oracleId | Counted once |
| NodeChain append failure after quorum | Fail closed |
| Process requires oracle, step skipped | **Forbidden** in v1 |

---

## Orchestrator integration

```text
if processType.requiresOracle:
  oracleGateway.requireOk(processId, attestations)
  // on throw → mark process expired; no PoT economic success path
else:
  // skip step; do not invent attestations
```

Gateway is **never** a public mint API.

---

## Explicit non-goals (API)

- Endpoints that set institutional valuation as AST  
- Endpoints that mint/burn/reserve  
- Endpoints that mark PoT `verified=1`  
- Admin `forceAccept(processId)`  

---

## Testing notes

- Unit tests may use deterministic `signature === sha256(JSON.stringify(payload)+'|'+oracleId)`  
- Production deployments must use real key material and disable stub acceptance if configuration allows  
