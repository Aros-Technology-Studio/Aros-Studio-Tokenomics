# Module: NodeChain

**Code:** `src/nodechain`  
**Canon:** §4.1, §III.3, invariants I3–I4  
**Decisions:** P1 nodechain  
**Pack:** `docs/components/nodechain/`

---

## Purpose

NodeChain is the **sole source of truth** for AST. A significant event (tokenization, value change, transfer of rights, revaluation, settlement, PoT verdict) is **valid only** if it is recorded as an append-only execution record on the linear main chain.

NodeChain does **not** appraise assets, compute mint amounts, or run PoT quorum math. It records, chains, and scopes access.

---

## Responsibility

| Owns | Does not own |
|------|----------------|
| Linear append-only main chain | PoT M-of-N evaluation |
| ExecutionSnapshot + content-hash linking | Emission / mint amounts |
| Process-local internal DAG under one `processId` | BFT consensus (later) |
| Primary durable store (RocksDB target) | Public multi-shard topology |
| Postgres **index mirror** (never SoT) | Full-history institution access |
| Encryption at rest for sensitive payloads | Product-API “blocks” vocabulary |
| Writer roles (internal + quorum validators) | Eye veto/rollback (forbidden everywhere) |

---

## Design summary

1. **Linear log** of execution records ordered by monotonic ledger height.  
2. **Immediate immutability** — no soft-open, seal-later, or update-in-place.  
3. **ExecutionSnapshot** — `hash` + `prevHash` evidence used by PoT and audit.  
4. **RocksDB** primary; **Postgres** secondary indexes only.  
5. Institutions **read own processes only**; Eye/audit may read full history.  
6. Append path: **internal service roles** and **quorum validators** only.

---

## Documents in this folder

| File | Content |
|------|---------|
| [data-model.md](./data-model.md) | ExecutionRecord, ExecutionSnapshot, process slice |
| [invariants.md](./invariants.md) | I3/I4, no rewrite, Postgres ≠ SoT |
| [api.md](./api.md) | Append, read, receipts; no `block*` names |
| [storage.md](./storage.md) | RocksDB, file/memory backends, mirror, encryption |

---

## Downstream consumers

- **pot** — verdict and evidence height before emission  
- **emission / aroscoin / commission** — record before client ack or settlement visibility  
- **orchestrator** — process navigation by `processId`  
- **all-seeing-eye** — audit stream (observe only)  

---

## Forbidden

- Free mint or privileged write that invents economic value  
- Treating ERC/Solidity mirrors as ledger SoT  
- Third-party custody payloads as AST client balances  
- Eye-driven delete, rewrite, or veto of appends  
