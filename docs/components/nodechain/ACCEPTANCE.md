# ACCEPTANCE — `nodechain`

**Status:** ready  

---

## Documentation ready when

- [x] Linear SoT log; Postgres mirror only  
- [x] No “blocks” vocabulary  
- [x] Append auth, read scope, immediate immutability  
- [x] P1.5 answers canonical  

---

## Implementation ready when

- [x] Append-only linear ledger + ExecutionSnapshot + content hashing (**Phase 1.1**)  
- [x] Append restricted to internal roles + quorum validators  
- [x] Institution read by processId; eye/audit full history scope  
- [x] Encryption at rest for sensitive payloads (AES-GCM; prod key via env)  
- [x] Integrity verification (fail closed on break)  
- [x] Single-shard only  
- [x] Tests: immutability, unauthorized append, scoped read, sensitive encrypt  
- [x] Durable primary via `LedgerStore` (`file` / `rocksdb` backend; memory for tests) — Phase 1.2  
- [x] Postgres **index mirror only** (optional; never SoT) — Phase 1.2  
- [ ] Native RocksDB package in production deploy (optional install; file fallback until then)  
- [ ] Lint/CI forbid `block`/`blocks` in public API surface (ongoing guards)  

---

## Explicit non-goals

- BFT inside NodeChain (v1)  
- Sharding (v1)  
- Soft finality  
- Institution full-ledger export  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Choose RocksDB vs BadgerDB | **RocksDB** | **closed** |
| Encryption key management | ops | open |
