# ACCEPTANCE — `invariants`

**Status:** ready  

---

## Documentation ready when

- [x] PURPOSE states boundary and anti-scope (no Eye veto)  
- [x] MODEL lists I1–I9 with versioning scheme  
- [x] CONTRACT defines assert / checkAll / InvariantBroken  
- [x] Owner P0 answers recorded as canonical  

---

## Implementation ready when

- [ ] `src/invariants/` Nest module with versioned registry  
- [ ] `assertInvariant` + `checkAll` + `InvariantBroken` emitter  
- [ ] Write-path integration points documented for pot, emission, aroscoin, reserve, nodechain  
- [ ] **CI: one automated test per I1–I9**  
- [ ] Online hard-gate tests for process-bound emission/burn conservation rules  
- [ ] Offline reconciliation job stub or test for secondary control  
- [ ] Selective custody (I6) as machine-checkable flag/policy-as-code  
- [ ] No admin bypass of asserts  

---

## Explicit non-goals

- Eye veto / rollback  
- Non-critical invariant tier  
- Soft “warn and continue” on I1–I9  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Exact reason-code enum for InvariantBroken | engineering | open |
| P1–P4 criteria live under pot (referenced by pot pack) | pot | pack cross-ref |
