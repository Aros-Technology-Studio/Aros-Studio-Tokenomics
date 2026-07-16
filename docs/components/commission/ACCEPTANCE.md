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

- [ ] Fee schedules per asset class  
- [ ] settleCommission after PoT only  
- [ ] distributeNodePayment + reserve accrue  
- [ ] Waivers/tiers  
- [ ] Every settlement on NodeChain  
- [ ] CI vocabulary clean (`npm run check:canon`)  
- [ ] Simple full distribution engine tests  

---

## Explicit non-goals

- Pre-PoT payment  
- Yield-style / banned-token API naming  
- Off-chain-only settlement  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Confirm default 70/30 vs other policy defaults | owner | default recorded 70/30 |
| Node weight formula detail | engineering | open |
