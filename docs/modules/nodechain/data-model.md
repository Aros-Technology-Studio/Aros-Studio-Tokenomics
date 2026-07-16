# NodeChain — Data Model

**Code:** `src/nodechain` (`ledger.types.ts` and stores)  
**Canon:** §4.1  

---

## Core entities

### ExecutionSnapshot

Hash-chained execution evidence attached to each append. Used by PoT as part of evidence and by replay for determinism checks.

| Field | Type | Meaning |
|-------|------|---------|
| `hash` | string | Content hash of this snapshot unit |
| `prevHash` | string | Hash of previous snapshot link |
| `processSequence` | number? | Optional process-local sequence (internal DAG under one `processId`) |

### ExecutionRecord (state entry)

Append-only unit of truth on the **linear main chain**.

| Field | Type | Meaning |
|-------|------|---------|
| `height` | number | Monotonic ledger height (order key) |
| `contentHash` | string | Hash of this record |
| `prevHash` | string | Hash of previous main-chain record |
| `processId` | string? | Process navigation key when process-bound |
| `recordType` | string | Domain type discriminator (e.g. pot verdict, mint, settlement) |
| `payload` | unknown | Typed by recordType; may be encrypted at rest |
| `createdAt` | string | ISO-8601 **UTC** |
| `snapshot` | ExecutionSnapshot | Evidence link |
| `sensitiveEncrypted` | boolean? | True if payload stored encrypted |

### Process slice (internal)

Within a single `processId`, related records may form an **internal DAG** via `processSequence` / snapshot links. The **main API surface remains a linear height-ordered log**. DAG is not the public multi-process topology.

### Index mirror row

Postgres projection for search and listing. **Not authoritative.** Repair direction is always primary ledger → mirror.

### Ledger height

Integer order key. Height increases on successful append only. No reuse, no gaps filled by rewrite.

---

## Writer and reader types

```
WriterRole = 'internal_service' | 'quorum_validator'
ReaderScope = 'own_process' | 'eye_or_audit'
```

Institutions map to `own_process` (filter by their processIds / claimIds). Eye and designated audit roles map to `eye_or_audit`.

---

## Append input / receipt

**AppendInput**

| Field | Required | Notes |
|-------|----------|-------|
| `processId` | often | Mandatory for process-bound significant events |
| `recordType` | yes | Stable string enum per domain |
| `payload` | yes | Must satisfy content-hash requirements |
| `writerRole` | yes | Authz gate |
| `sensitive` | no | If true, encrypt before persistence |

**AppendReceipt**

| Field | Notes |
|-------|-------|
| `height` | Assigned height |
| `contentHash` | Record hash |
| `prevHash` | Chain link |
| `processId` | Echo when present |
| `createdAt` | UTC timestamp |

Receipts are immutable facts; clients must not invent heights.

---

## Lifecycle

```
append(entry) → immediately immutable
never: update-in-place | soft-open | seal-later | delete
```

Failed appends produce no height. Replay of the same authorized payload after success is rejected as duplicate or handled by idempotency at the caller (orchestrator), not by mutating history.

---

## Vocabulary (normative)

| Allowed | Forbidden in product API / public DTOs |
|---------|----------------------------------------|
| snapshot, execution record, state entry | block, blocks |
| ledger, chain height, append | blockchain (as NodeChain self-description in product API) |
| content hash, processId | “mined block”, “block hash” product fields |

---

## Relation to other modules

- PoT stores verdict + snapshot hash at a height before emission.  
- ArosCoin acks mint/burn only after NodeChain success.  
- Commission settlements are NodeChain-visible or fail closed.  
