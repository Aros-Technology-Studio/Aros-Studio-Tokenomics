# ACCEPTANCE — `oracle-gateway`

**Status:** ready  

---

## Documentation ready when

- [x] PURPOSE: multi-oracle transport; not self-appraisal  
- [x] MODEL: distinct signatures; requiredCount  
- [x] CONTRACT: fail-closed; NodeChain on accept  
- [x] P4.16 decisions recorded  

---

## Implementation ready when

- [x] `src/oracle-gateway/` module + service + types  
- [x] Multi-oracle distinct count + signature path  
- [x] Fail closed when quorum not met  
- [x] NodeChain append on accept  
- [x] Unit tests accept + fail  
- [ ] Production-grade signature schemes + oracle allowlist  
- [ ] Orchestrator pipeline hard-wire when process type requires oracle  
- [ ] Eye notification on fail  

---

## Explicit non-goals

- Skip-oracle in v1 when step required  
- Single anonymous HTTP feed as sole trust  
- Valuation invention  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Trust model | multi-oracle + signatures | **closed** |
| Fail policy | fail-closed / expired | **closed** |
| Prod key material | ops | open |
