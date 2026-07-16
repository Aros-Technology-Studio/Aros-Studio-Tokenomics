# ACCEPTANCE — `release`

**Status:** ready  

---

## Documentation ready when

- [x] System+governance phase control; daemon role  
- [x] Config-only thresholds; block/allow lists  
- [x] Split from partial asset release; reverse allowed  
- [x] P2.12 answers canonical  

---

## Implementation ready when

- [ ] Phase state machine + config thresholds  
- [ ] Daemon hook for initiate  
- [ ] Governance multi-step approval  
- [ ] Gate enforcement for external actions  
- [ ] NodeChain events with prevStateHash + verifier signatures  
- [ ] Atomic integration tests with burn/reserve where applicable  
- [ ] Reverse phase path with NodeChain  
- [ ] Separate stub/boundary for partial-release module  

---

## Explicit non-goals

- Hard-coded threshold constants as only source  
- Holder-triggered phase  
- Merging partial asset release into phase module  
- Eye-driven phase veto  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Name/path of partial-release module | engineering | open (split confirmed) |
| Config key names for threshold/target | engineering | open |
