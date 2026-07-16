# ACCEPTANCE — `velocity-tracker`

**Status:** ready  

---

## Documentation ready when

- [x] PURPOSE: §9.6 formula; daemon consumer  
- [x] MODEL: 24h UTC; fail closed incomplete  
- [x] CONTRACT: API + no phase flip  
- [x] P4.16 real in v1  

---

## Implementation ready when

- [x] `src/velocity-tracker/` service + tests for volume/supply  
- [x] Division safe; supply ≤ 0 → 0  
- [ ] Auto-ingest 24h window from NodeChain confirmed volume  
- [ ] Circulating supply from aroscoin ledger projection  
- [ ] Integration test with release-daemon thresholds  
- [ ] UTC window rollover tests  

---

## Explicit non-goals

- Phase state machine  
- Magic hard-coded release targets as sole config  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Formula | §9.6 | **closed** |
| Live NodeChain feed | build | open (pre-prod) |
