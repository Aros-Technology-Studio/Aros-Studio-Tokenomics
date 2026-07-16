# PURPOSE — `nodechain`

**Status:** ready  
**Canon refs:** `CANON.md` §4.1, §III.3, §XI I3–I4  
**Code path:** `src/nodechain/` (maps to `nodechain_engine` / `ledger`)  
**Clarifications:** P1.5 canonical v1

---

## Why this exists

NodeChain is the **sole source of truth**: append-only immutable ledger. A NodeChain record is what makes a significant event valid.

---

## Responsibility

- Owns: linear append-only main chain, ExecutionSnapshot / execution record / state entry model, content-hash linking, processId navigation, primary store (RocksDB/BadgerDB), Postgres index mirror, at-rest encryption for sensitive data, append authorization (internal roles + quorum validators), read scoping.
- Contributes to: ordering via chain height; uniqueness support for processId; evidence store for PoT.
- Does **not** own: PoT quorum math, mint amounts, BFT consensus in v1, multi-shard topology, public full-history for institutions.

---

## Boundary (must not)

- Must not use the word **“block(s)”** in public API, docs, or code identifiers.  
- Must not treat Postgres as source of truth.  
- Must not allow soft finality or rewrite of appended entries.  
- Must not allow arbitrary node direct append.  
- Must not expose full ledger history to institutions (own processes only).  
- Must not implement BFT as v1 requirement.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Linear append-only main chain | Chain-of-blocks metaphor |
| DAG only inside one processId (internal) | Public DAG-as-main-API |
| Primary RocksDB/BadgerDB ledger | Postgres as SoT |
| Postgres secondary indexes only | Single-store confusion |
| Encryption at rest for sensitive data | Plain sensitive payloads at rest |
| Append: internal roles + quorum validators | Open append from any node |
| Institution read: own processId/claimId only | Full history for all institutions |
| Immediate immutability | Soft → seal finality |
| Content hashes + processId links | FK-only without hashes |
| PoT+quorum sufficient in v1 | Mandatory BFT in v1 |
| Single shard | Sharding in v1 |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `pot` | verdicts recorded here before emission |
| `aroscoin` / `emission` / `commission` | events before client ack / settlement visibility |
| `nodes` | validator identity for append rights |
| `all-seeing-eye` | full-history / audit read path |
| `invariants` | I3/I4 checks against ledger |
