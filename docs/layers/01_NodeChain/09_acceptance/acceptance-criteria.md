# Acceptance criteria — 01_NodeChain

Layer **pilot done** when documentation + implementation checklists are true **and** owner review is signed.  
Residual ops (B2–B4) may remain open after pilot accept — see below.

**Owner review package:** [`OWNER-REVIEW.md`](./OWNER-REVIEW.md) (B1).

## Documentation

- [x] Scope, non-goals, boundaries written  
- [x] Ledger model, schema, hash chain, snapshot, write/read, validity  
- [x] Nodes, crypto, process binding, network, storage, integrity, API  
- [x] Assembly run book (`ASSEMBLY.md`)  
- [x] Vocabulary: chain **nodes** vs network nodes (`VOCABULARY.md`)  
- [ ] Owner review pass (B1) — pending owner: reply **`B1 approved`** in chat or sign `OWNER-REVIEW.md`

## Implementation (pilot)

- [x] Append assigns height and persists crash-safe (file / rocksdb)  
- [x] Hash chain verifies genesis→tip (`verifyChain`, CLI, HTTP)  
- [x] Immutability enforced (no update/delete API; frozen records in memory store)  
- [x] Idempotent `clientRecordId`  
- [x] Ed25519 signatures on contentHash (no pseudo signatures)  
- [x] Index mirror optional and non-authoritative (`IndexMirror` / Postgres)  
- [x] Kill-switch read-only (`globalKillSwitch` + `setReadOnly`)  
- [x] HTTP query surface `/v1/core/nodechain/*` (status, tip, verify, get, **nodes list**, list-by-process)  
- [x] Boot genesis via `NodechainBootstrap`  
- [x] CLI: genesis, first-record, status, tip, verify, dump  
- [x] Tests: unit + store + replicator (see `test-plan.md` / Jest under `src/nodechain`)  

## Residual ops

- [x] **B2** Encryption at rest on durable journal (AES-256-GCM; `at-rest.ts`; file/rocksdb default on)  
- [x] **B3** Institution read scoping on Core HTTP (`read-scope.ts`; own processId only; ops token full)  
- [x] **B4** Durable event stream for observers (`event-stream/`; resume `GET /v1/core/eye/stream`)

## Explicitly not required for this layer’s pilot done

- PoT P1–P4 engine  
- All-Seeing Eye AI agents  
- Commission math  
- UI / portal mint  
- Product-API “blocks” (forbidden — use **nodes**)  
