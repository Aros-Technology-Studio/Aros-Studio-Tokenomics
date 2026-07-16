# ACCEPTANCE — `node-reputation`

**Status:** ready  

---

## Documentation ready when

- [x] PURPOSE: reputation/weight; suspend without slashing  
- [x] MODEL: formula §9.8; grace 24h lifecycle  
- [x] CONTRACT: inputs/outputs; no slash API  
- [x] P4.16 real in v1  

---

## Implementation ready when

- [x] `src/node-reputation/` Nest module + service  
- [x] Formula `(successes/total)*uptimeFactor`  
- [x] `suspendWithGrace` + `maybeRestore` with 24h default  
- [x] Unit tests: score + grace restore  
- [x] Wire weights into commission path (`weightsFor` + `CommissionService.resolveNodeWeights`)  
- [x] Eye-visible events on suspend/restore (EventEmitter → Eye observe/notify)  
- [ ] Durable persistence of reputation rows (v1 may start in-memory; durable before prod)  
- [ ] Integration: suspended node excluded from PoT quorum assignment  

---

## Explicit non-goals

- Slashing  
- Eye-driven suspend as veto of economic processes  
- Negative balances  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Grace default | 24h §XII | **closed** |
| Formula | §9.8 | **closed** |
| Durable store for reputation | build / ops | open (pre-prod) |
