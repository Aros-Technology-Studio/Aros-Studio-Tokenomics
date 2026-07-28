# Acceptance criteria — 01_NodeChain

Layer is **done** only when all items below are true (docs + implementation).

## Documentation

- [x] Scope, non-goals, boundaries written  
- [x] Ledger model, schema, hash chain, snapshot, write/read, validity  
- [x] Nodes, crypto, process binding, network, storage, integrity, API  
- [x] Assembly run book (`ASSEMBLY.md`)  
- [ ] Owner review pass (open)

## Implementation

- [x] Append assigns height and persists crash-safe (file / rocksdb)  
- [x] Hash chain verifies genesis→tip (`verifyChain`, CLI, HTTP)  
- [x] Immutability enforced (no update/delete API; frozen records in memory store)  
- [x] Idempotent `clientRecordId`  
- [x] Ed25519 signatures on contentHash (no pseudo signatures)  
- [x] Index mirror optional and non-authoritative (`IndexMirror` / Postgres)  
- [x] Kill-switch read-only (`globalKillSwitch` + `setReadOnly`)  
- [x] HTTP query surface `/v1/core/nodechain/*` (status, tip, verify, get, list-by-process)  
- [x] Boot genesis via `NodechainBootstrap`  
- [x] CLI: genesis, first-record, status, tip, verify, dump  
- [x] Tests: unit + store + replicator (see `test-plan.md` / Jest under `src/nodechain`)  
- [ ] Encryption at rest on (file path is process-local; HSM/KeyProvider for keys — residual ops)  
- [ ] Institution read scoping on HTTP (portal/institution layer; journal store is full SoT)  
- [ ] Event stream for observers (All-Seeing Eye in-process history; durable stream residual)

## Explicitly not required for this layer’s “done”

- PoT P1–P4 engine  
- All-Seeing Eye AI agents  
- Commission math  
- UI / portal mint  
