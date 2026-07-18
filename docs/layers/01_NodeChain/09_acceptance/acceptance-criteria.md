# Acceptance criteria — 01_NodeChain

Layer is **done** only when all items below are true (docs + later implementation).

## Documentation

- [x] Scope, non-goals, boundaries written  
- [x] Ledger model, schema, hash chain, snapshot, write/read, validity  
- [x] Nodes, crypto, process binding, network, storage, integrity, API  
- [ ] Owner review pass (open)

## Implementation (when code phase starts)

- [ ] Append assigns height and persists crash-safe  
- [ ] Hash chain verifies genesis→tip  
- [ ] Immutability enforced (no update/delete API)  
- [ ] Idempotent clientRecordId  
- [ ] Encryption at rest on  
- [ ] Index mirror optional and non-authoritative  
- [ ] Institution read scoping  
- [ ] Event stream for observers (All-Seeing Eye/ops)  
- [ ] Kill-switch read-only  
- [ ] Tests in test-plan green  

## Explicitly not required for this layer’s “done”

- PoT P1–P4 engine  
- All-Seeing Eye AI agents  
- Commission math  
- UI  
