# Query API

```text
GetByHeight(height) → Record
GetByRecordId(recordId) → Record
ListByProcessId(processId, cursor?) → Record[]
GetTip() → { height, tipHash }
GetStatus() → tip + hasGenesis + chain + readOnly   # ops extension
VerifyChain() → { ok, height, error? }
```

## HTTP (core Nest)

| Call | Route |
|------|-------|
| GetTip | `GET /v1/core/nodechain/tip` |
| GetStatus | `GET /v1/core/nodechain/status` |
| VerifyChain | `GET /v1/core/nodechain/verify` |
| GetByHeight | `GET /v1/core/nodechain/records/height/:height` |
| GetByRecordId | `GET /v1/core/nodechain/records/id/:recordId` |
| ListByProcessId | `GET /v1/core/nodechain/processes/:processId?limit=` |

List returns up to `limit` (default 100, max 500) most recent process-scoped rows.

## AuthZ

Institution principals: filter to own processes (portal / edge policy).  
Core journal HTTP is internal-ops by default; do not expose write append publicly.  
Internal/All-Seeing Eye: broader per policy.

## Errors

`E_NOT_FOUND`, `E_UNAUTHORIZED`, `E_UNAUTHENTICATED`, `E_HASH_MISMATCH` (verify).
