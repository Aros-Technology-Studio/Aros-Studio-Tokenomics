# PURPOSE — `state-recording`

**Status:** ready  
**Canon refs:** `CANON.md` §4.1, §XI I3–I4  
**Code path:** `src/state-recording/`  
**Clarifications:** P2.11 canonical v1

---

## Why this exists

Records **process state snapshots** (hash-chained) **inside** the NodeChain ledger — write-ahead, immutable forever — so business actions cannot complete without a durable causal record.

---

## Responsibility

- Owns: state record schema, write-ahead API used by pipeline, sequence/hash chain within process, encryption-before-write for sensitive fields, institution-scoped query, built-in **replay** for determinism.
- Contributes to: I3/I4 evidence; orchestrator step “State Update”.
- Does **not** own: a second source of truth store; redaction; full-history for all institutions.

---

## Boundary (must not)

- Must not use a separate SoT store (indexes only as secondary).  
- Must not redact history.  
- Must not ack side effects before record.  
- Must not allow institution to query others’ processes.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Schema fields listed in MODEL | Ad-hoc incomplete records |
| Same ledger as NodeChain; indexes separate | Parallel “truth” DB |
| Write-ahead before side-effect ack | Ack-then-write |
| Immutable; retain forever | Soft delete / redact |
| Encrypt sensitive before write | Redaction of history |
| Query own processId/claimId only | Global institution dump |
| processId always present | Missing correlation |
| Fail closed if record fails | Continue without record |
| Built-in replay tool v1 | Replay “later” only |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `nodechain` | underlying ledger |
| `orchestrator` | drives state updates |
| `invariants` | determinism checks via replay |
| `all-seeing-eye` | may observe all via NodeChain rights |
