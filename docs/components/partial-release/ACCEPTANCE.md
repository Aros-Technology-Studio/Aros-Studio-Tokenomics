# ACCEPTANCE — `partial-release`

**Status:** ready  

---

## Documentation ready when

- [x] Split module name fixed  
- [x] PURPOSE / MODEL / CONTRACT packs  
- [x] Holder+institution; full process; atomic burn/reserve  
- [x] Internal-only pre-phase; pro-rata; burn+remint  
- [x] Process doc `docs/processes/partial-release.md`  

---

## Implementation ready when

- [x] Implementation under `src/partial-release/`  
- [x] Core API path `POST /v1/core/partial-release` (scaffold)  
- [ ] Portal request UI integration  
- [ ] E2E partial process tests (full orchestrator path)  
- [ ] Governance config for large partials  

---

## Explicit non-goals

- Merging into Release Phase module  
- External partial before phase without compliance gates  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Module split | P4.15 | **closed** |
| Portal UX | portal / Phase 5 polish | open |

