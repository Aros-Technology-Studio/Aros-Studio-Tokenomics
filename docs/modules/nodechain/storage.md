# NodeChain — Storage

**Code:** `src/nodechain` (`LedgerStore`, RocksDB / file / memory, Postgres mirror)  
**Decisions:** P1 nodechain — RocksDB primary; Postgres index mirror only  
**Canon defaults:** §XII primary ledger engine RocksDB  

---

## Roles of stores

| Store | Role | Authoritative? |
|-------|------|----------------|
| Primary `LedgerStore` | Append-only execution log | **Yes (SoT)** |
| Postgres index mirror | Search / list projections | **No** |
| Analytic mirror (Eye) | Observation lag ≤ 30s target | **No** |

If primary is unavailable, the system **fails closed**. Operators must not reconfigure “Postgres as truth.”

---

## Primary backends

Configured via `LEDGER_BACKEND` (implementation):

| Backend | Use |
|---------|-----|
| `memory` | Tests / ephemeral local |
| `file` | Durable JSONL-style primary under `LEDGER_PATH` |
| `rocksdb` | **Production target** — RocksDB-oriented primary |

RocksDB is the ratified primary durable engine for v1 production posture. File backend is an acceptable durable stand-in when native RocksDB is not installed; memory is never SoT for sandbox/prod.

---

## Linear layout

```
height 0..N  →  contentHash, prevHash, processId?, recordType, payload, snapshot
```

- Single shard in v1 (no multi-shard routing).  
- Height is monotonic and assigned only on successful append.  
- Process-local DAG is an **overlay** for one `processId`, not a second SoT.

---

## Postgres index mirror

| Property | Rule |
|----------|------|
| Purpose | Secondary indexes (processId, recordType, time) |
| Write path | Projection after primary append (eventual) |
| Read for economic gate | Confirm against primary when correctness matters |
| Rebuild | From primary replay only |

Mirror lag is operational, not a second history. Repair direction: **primary → mirror**.

---

## Encryption at rest

- Required for **sensitive** payloads in v1 (`sensitive: true` on append).  
- Encryption keys from config/secrets; not embedded in records.  
- `sensitiveEncrypted` flag on `ExecutionRecord` marks encrypted storage.  
- Redaction of historical payloads is **forbidden** (state-recording / canon: immutable forever).  
- Access control is on decrypt/read, not on rewriting ciphertext out of history.

---

## Writer roles and durability

| Role | May append | Notes |
|------|------------|-------|
| `internal_service` | yes | Orchestrator pipeline modules |
| `quorum_validator` | yes | PoT confirmation path |

Unauthorized identities never reach durable write. Successful append is immediately immutable — no “uncommitted height.”

---

## Institution vs Eye read paths

| Reader | Storage path | Scope |
|--------|--------------|-------|
| Institution | Primary (or mirror + confirm) | Own `processId` / claim set only |
| Eye / audit | Primary + analytic mirror | Full history for observation |

Institutions never receive “dump all heights” APIs.

---

## Failure modes

| Failure | Behavior |
|---------|----------|
| Primary write fail | No receipt; caller fail closed |
| Mirror write fail | Log/alert; primary remains SoT; retry projection |
| Decrypt key missing | Deny read of sensitive payload |
| Backend misconfig (Postgres-as-primary) | Forbidden; treat as ops defect |

---

## Implementation map

| Concern | Typical files under `src/nodechain` |
|---------|--------------------------------------|
| Types | `ledger.types.ts` |
| Interface | `ledger-store.interface.ts` |
| Memory / file / rocks | `*-ledger.store.ts` |
| Mirror | `postgres-index-mirror.ts` |
| Sensitive payload | `sensitive-payload.ts` |
| Service facade | `nodechain.service.ts` |
