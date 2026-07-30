# Query API

```text
GetByHeight(height) → Node (journal entry at height)
GetByRecordId(recordId) → Node
ListByProcessId(processId, cursor?) → Node[]
ListNodes(limit?) → Node[]   # tip-first Nodes list (explorer feed)
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
| ListNodes | `GET /v1/core/nodechain/nodes?limit=` |
| GetByHeight | `GET /v1/core/nodechain/records/height/:height` |
| GetByRecordId | `GET /v1/core/nodechain/records/id/:recordId` |
| ListByProcessId | `GET /v1/core/nodechain/processes/:processId?limit=` |

ListNodes returns up to `limit` (default 25, max 200) tip-first **nodes**  
(`height`, `envelopeHash`, `prevHash`, …). Response body field: **`nodes`**.  

ListByProcessId returns up to `limit` (default 100, max 500) most recent process-scoped rows.  

**Vocabulary**

| Prefer | Forbidden / avoid |
|--------|-------------------|
| **Node** (unit of NodeChain at a height) | product-API **block / blocks** |
| height, envelopeHash, prevHash | blockchain “blockNumber / parent block” |
| `/v1/core/nodechain/nodes` | `/blocks` |

Do not confuse with the **network participant registry** at `GET /v1/core/nodes` (writers/validators).  
NodeChain **nodes list** = chain positions; Core **nodes** registry = network actors.  

**B5 dual-API map:** [`nodes-vs-registry.md`](./nodes-vs-registry.md).

## AuthZ (B3 — Core read scope)

| Principal | How | Access |
|-----------|-----|--------|
| **ops** | `X-Ops-Token` = `AST_OPS_READ_TOKEN` | Full journal |
| **institution** | `X-Institution-Id` + `X-Institution-Token` | System rows + **own** `processId` only (`AST-{INST}-…`) |
| **anonymous** | no institution/ops headers | Full read if `AST_NODECHAIN_PUBLIC_READ=1` (default pilot explorer); system-only if `=0` |

Rules:

- Foreign process history / records → **404** (no existence leak).  
- `ListNodes` for institution: system + own processes only; response includes `scope`.  
- Status / tip / verify remain chain-health surfaces (no process payload dump).  
- Append still not public HTTP.

Code: `src/core-api/read-scope.ts` · `CoreNodechainController`.

## Errors

`E_NOT_FOUND`, `E_UNAUTHORIZED` / auth codes, `E_HASH_MISMATCH` (verify).
