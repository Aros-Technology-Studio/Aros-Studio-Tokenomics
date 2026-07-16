# ACCEPTANCE — `all-seeing-eye`

**Status:** ready  

---

## Documentation ready when

- [x] Observe/notify only; no veto/rollback  
- [x] Separate process; NodeChain + mirror  
- [x] All events; batch + critical sync; reason codes  
- [x] P1.9 answers canonical  

---

## Implementation ready when

- [ ] Separate deployable process  
- [ ] Subscribes to all events; depth configurable  
- [ ] Critical sync alerts + async batches  
- [ ] Reason code enum  
- [ ] Fan-out to ops + orchestrator  
- [ ] NodeChain-anchored findings; analytic mirror non-SoT  
- [ ] Config: disable only non-prod  
- [ ] Static/CI checks: no mint/burn/pay/veto/rollback exports  
- [ ] Tests: Eye cannot stop write; executing module fail-closed still works  

---

## Explicit non-goals

- Veto / rollback  
- Economic initiation  
- Production disable  
- Policing executive  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Reason code catalog v1 list | engineering | open (required) |
| Critical vs non-critical classification rules | owner | open (both channels exist) |
| Analytic mirror max lag | 30 seconds | **closed** |
