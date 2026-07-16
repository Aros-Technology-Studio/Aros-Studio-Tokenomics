# ACCEPTANCE — `emission`

**Status:** ready  

---

## Documentation ready when

- [x] valuation+ΔValue replaces αTV+βU+γ  
- [x] Calls aroscoin.mint; pro-rata here  
- [x] Caps, floor rounding, zero/burn policy  
- [x] P1.7 answers canonical  

---

## Implementation ready when

- [ ] Deterministic plan pure functions + tests (replay)  
- [ ] Floor to 9 decimals  
- [ ] Per-asset-class caps  
- [ ] Integration: only after pot verified  
- [ ] Invokes aroscoin.mint / burn  
- [ ] Pro-rata unit tests (I9)  
- [ ] Asset policy for zero vs burn  
- [ ] No live αTV+βU+γ code path  

---

## Explicit non-goals

- AST as appraiser  
- Admin emission parameters without governance  
- DTO-only emission without mint call  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Default cap values per asset class | owner | open |
| Default asset policy zero vs burn | owner | open |
