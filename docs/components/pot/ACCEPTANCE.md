# ACCEPTANCE — `pot`

**Status:** ready  

---

## Documentation ready when

- [x] PURPOSE: only gate for value; no amount calc  
- [x] MODEL: evidence, M-of-N, finality, expired  
- [x] CONTRACT: NodeChain-before-emission, double-confirm error  
- [x] P0.2 answers canonical  

---

## Implementation ready when

- [ ] `src/pot/` implements pending → verified|expired  
- [ ] Evidence schema enforced (processId, snapshot, validators, signatures, criteriaResult)  
- [ ] Configurable M-of-N (default 2/3)  
- [ ] processId uniqueness + ledgerHeight ordering  
- [ ] NodeChain append before any ok-to-emit  
- [ ] Emission cannot run without recorded verified=1  
- [ ] Double-confirm tests → error + event for Eye  
- [ ] Unit tests for timeout → expired → new processId only  
- [ ] Integration with `invariants` asserts (I1)  

---

## Explicit non-goals

- Amount / institutional price math (emission)  
- Eye veto  
- Admin force-verified  
- Revocation of verified  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Formal text of criteria P1–P4 | CANON §4.2 | **closed** |
| PoT timeout default | 15 minutes | **closed** |
