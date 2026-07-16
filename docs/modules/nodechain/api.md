# NodeChain — API

**Code:** `src/nodechain` (`NodechainService`, ledger stores)  
**Canon:** §4.1  
**Rule:** Never expose `block*` routes or DTO field names in product API.

---

## Surface style

NodeChain is an **internal service API** (NestJS injectable), not a public institution mint surface. Institutions reach process history through orchestrator/portal with **own-process** scoping. Eye uses a privileged audit read path.

---

## Operations

### append

Record a new execution entry on the linear main chain.

**Input (conceptual)**

```
AppendInput {
  processId?: string
  recordType: string
  payload: unknown
  writerRole: 'internal_service' | 'quorum_validator'
  sensitive?: boolean
}
```

**Output**

```
AppendReceipt {
  height: number
  contentHash: string
  prevHash: string
  processId?: string
  createdAt: string  // UTC ISO-8601
}
```

**Rules**

- Only allowed writer roles.  
- Immediate immutability on success.  
- `sensitive: true` → encrypt payload before primary persistence.  
- Fail closed on store or validation error (`NODECHAIN_APPEND_FAILED`).

### getByHeight / getByContentHash

Read a single execution record from **primary** store.

### listByProcessId

Return height-ordered records for one process. Institution callers must be authorized for that process.

### queryIndex (mirror)

Optional search via Postgres index mirror (time range, recordType). Results must be **confirmed against primary** when used for economic decisions; mirror is convenience only.

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `LedgerAppended` | out | New state entry at height |
| `LedgerAppendRejected` | out | Auth / validation / store failure |

---

## Authorization matrix

| Actor | Append | Read own process | Read full history |
|-------|--------|------------------|-------------------|
| Internal service (pipeline) | yes | yes | as configured |
| Quorum validator | yes (verdict/evidence path) | limited | no |
| Institution (portal) | no direct | **yes only** | **no** |
| All-Seeing Eye | no | n/a | yes (observe) |
| Arbitrary node | no | no | no |

---

## Error codes (common)

| Code | When |
|------|------|
| `NODECHAIN_APPEND_UNAUTHORIZED` | Writer role or identity denied |
| `NODECHAIN_APPEND_FAILED` | Store / validation failure |
| `INVALID_PROCESS_ID` | Malformed processId when required |
| `KILL_SWITCH_ACTIVE` | Read-only mode blocks append |

---

## Naming bans

| Forbidden in public/product API | Use instead |
|---------------------------------|-------------|
| `/blocks`, `blockNumber`, `blockHash` | `/records`, `height`, `contentHash` |
| “latest block” | “latest height” / “head receipt” |
| “mine a block” | “append execution record” |

Code comments and internal store keys should also avoid product “blocks” metaphors where possible; CI/canon gates target product API and docs.

---

## Ordering contract with economic modules

1. PoT verification append **before** emission.  
2. Mint/burn NodeChain append **before** client ack.  
3. Settlement NodeChain visibility **mandatory** for `settleCommission`.  

No module may treat an in-memory success without NodeChain receipt as final.
