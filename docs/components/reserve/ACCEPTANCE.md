# ACCEPTANCE — `reserve`

**Status:** ready  

---

## Documentation ready when

- [x] Selective custody and multi-asset bag model stated  
- [x] Primary = NodeChain; Solidity mirror  
- [x] reserveIndex formula and hard-fail rules  
- [x] P0.3 answers canonical  

---

## Implementation ready when

- [ ] `src/reserve/` multi-asset bag + claim accounting  
- [ ] Lock API: reserve service + contract hard lock hook  
- [ ] Child records on partial release (immutable)  
- [ ] Hard fail on insufficient funds (no queue)  
- [ ] `reserveIndex = log10(1 + totalProcessVolume)` tested  
- [ ] Internal-only module boundaries (no public controller in v1)  
- [ ] Tests: one bag many claims; snapshot rate; I6 custody reject  
- [ ] Mirror adapter interface stub for Solidity  

---

## Explicit non-goals

- External Anchor as primary store (later)  
- Public institutional reserve API in v1  
- Holding client funds  
- Eye veto on shortfall  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Numeric `threshold` for Release Phase | owner | open (formula fixed) |
| Asset type enum final list | engineering | open (multi confirmed) |
