# ACCEPTANCE — `state-recording`

**Status:** ready  

---

## Documentation ready when

- [x] Schema fixed; same ledger as NodeChain  
- [x] Write-ahead; no redaction; encrypt before write  
- [x] Replay tool required  
- [x] P2.11 answers canonical  

---

## Implementation ready when

- [ ] Record writer with full schema  
- [ ] Write-ahead enforcement in pipeline  
- [ ] Encryption before write for sensitive  
- [ ] Forever immutability (no update/delete)  
- [ ] Institution query scoped  
- [ ] Replay tool + tests  
- [ ] Fail closed integration tests  

---

## Explicit non-goals

- Separate SoT store  
- History redaction  
- Soft retention  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| stateType enum catalog | engineering | open |
