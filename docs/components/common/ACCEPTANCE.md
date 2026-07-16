# ACCEPTANCE — `common`

**Status:** ready  

---

## Documentation ready when

- [x] Allow-list / deny-list for contents  
- [x] Barrel-only; testing separate; error catalog  
- [x] Semver deprecate-not-delete v1  
- [x] P3.13 answers canonical  

---

## Implementation ready when

- [ ] `src/common` barrel with money, ids, errors, crypto, log, config  
- [ ] One decimal library chosen and wrapped  
- [ ] Central error/reason catalog  
- [ ] ESLint/boundary rule: no domain imports into common  
- [ ] `testing/` package scaffolded separately  
- [ ] Deprecation policy documented in code for shared types  

---

## Explicit non-goals

- Business rules in common  
- Domain event catalog  
- Deep-import public API  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Choose decimal.js vs big.js | **decimal.js** | **closed** |
