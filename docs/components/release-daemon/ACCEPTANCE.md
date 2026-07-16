# ACCEPTANCE — `release-daemon`

**Status:** ready  

---

## Documentation ready when

- [x] PURPOSE: initiates only; no Eye powers  
- [x] MODEL: AND of reserveIndex & velocity vs config  
- [x] CONTRACT: tick; met vs activated  
- [x] P4.16 real in v1  

---

## Implementation ready when

- [x] `src/release-daemon/` module + service  
- [x] configure + tick with reserve + velocity + release  
- [x] Unit test: met + governance ok → activated  
- [ ] Deployable long-running process / cron wiring  
- [ ] Integration tests with mock metrics + NodeChain phase event  
- [ ] Ops runbook (poll interval, alert on met-not-activated)  
- [ ] Config sourced from documented keys only in prod  

---

## Explicit non-goals

- Eye veto  
- Hard-coded sole thresholds without config  
- Partial-release  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Real in v1 | P4.16 | **closed** |
| Deploy process | ops / Phase 5 | open |
