# ACCEPTANCE — `orchestrator`

**Status:** ready  

---

## Documentation ready when

- [x] Sole entry; processId rules; fixed 9-step pipeline  
- [x] Compensation saga ≠ Eye rollback  
- [x] Idempotency, concurrency 10, 30m timeout  
- [x] P2.10 answers canonical  

---

## Implementation ready when

- [ ] StartProcess with UUIDv7 + institutional prefix  
- [ ] Mandatory idempotencyKey  
- [ ] Pipeline order enforced  
- [ ] Compensation on failure with tests  
- [ ] L1 AI integration real (L2/L3 optional hooks)  
- [ ] Optional human approval gate by policy  
- [ ] Concurrency limit default 10  
- [ ] Timeouts process 30m + per-step config  
- [ ] No public side-entry to emission/settlement  

---

## Explicit non-goals

- PoT self-verify  
- Eye veto/rollback  
- Business truth only in logs  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Institutional prefix format | engineering | open |
| Per-step default timeout values | owner | open (mechanism fixed) |
