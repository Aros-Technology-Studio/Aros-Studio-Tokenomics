# MODEL — `nodechain`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §4.1

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| State entry / execution record | Append-only unit of truth | content hash + chain height |
| ExecutionSnapshot | Hash-chained execution evidence | hash, prevHash |
| Process slice | Optional internal DAG under one process | processId |
| Index mirror row | Postgres search projection | not authoritative |
| Ledger height | Monotonic order key | integer height |

---

## States and lifecycle

```
append(entry) → immediately immutable
never: update-in-place, soft-open, seal-later
```

Main structure: **linear log**. Internal DAG only as representation within a single `processId`.

---

## Invariants

| Rule | Effect if violated |
|------|--------------------|
| I3 — significant event not on ledger | event invalid / fail closed |
| I4 — non-deterministic replay | fail closed |
| No rewrite of past entries | reject |
| Postgres ≠ SoT | repair mirror toward primary |

---

## Vocabulary (normative)

**Allowed:** snapshot, execution record, state entry, ledger, chain height, append  
**Forbidden:** block, blocks, blockchain (as NodeChain self-description in product API)

---

## Storage

| Store | Role |
|-------|------|
| RocksDB or BadgerDB | **Primary** append-only ledger |
| Postgres | **Secondary** indexes / search only |

Encryption at rest: **required** for sensitive fields in v1.
