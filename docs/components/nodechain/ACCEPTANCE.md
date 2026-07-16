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

- [ ] Primary append-only ledger (RocksDB or BadgerDB)  
- [ ] Postgres index mirror (not SoT)  
- [ ] Encryption at rest for sensitive data  
- [ ] Append restricted to internal roles + quorum validators  
- [ ] Institution read filtered by own processId/claimId  
- [ ] Eye/audit full-history path  
- [ ] Content-hash links + processId navigation  
- [ ] Lint/CI forbid `block`/`blocks` in public API surface  
- [ ] Single-shard only  
- [ ] Tests: immutability, unauthorized append, mirror lag ≠ truth  

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
| Choose RocksDB vs BadgerDB | engineering | open (both allowed) |
| Encryption key management | ops | open |
