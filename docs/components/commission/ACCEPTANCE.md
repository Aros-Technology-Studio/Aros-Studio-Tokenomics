# ACCEPTANCE — `commission`

**Status:** ready  

---

## Documentation ready when

- [x] Multi-schedule, valuation base, on-PoT, ARO  
- [x] Default 70/30 configurable; full engine; NodeChain visibility  
- [x] Vocabulary resolved to settleCommission / distributeNodePayment  
- [x] P1.8 answers canonical  

---

## Implementation ready when

- [x] settleCommission after PoT only  
- [x] distributeNodePayment + reserve accrue  
- [x] Every settlement on NodeChain  
- [x] Simple full distribution engine tests  
- [x] Node weights from reputation (`resolveNodeWeights` / `weightsFor`)  
- [ ] Fee schedules per asset class  
- [ ] Waivers/tiers  
- [ ] CI vocabulary clean (`npm run check:canon`) on every PR  

---

## Explicit non-goals

- Pre-PoT payment  
- Yield-style / banned-token API naming  
- Off-chain-only settlement  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Confirm default 70/30 vs other policy defaults | 70/30 ship default | **closed** |
| Sandbox feeRate example | 0.15% | **closed** |
| Node weight formula | reputation §9.8 × uptime | **closed** (wired) |
| Multi-schedule per asset class | build | open |
