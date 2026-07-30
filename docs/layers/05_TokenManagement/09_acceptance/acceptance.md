# Acceptance — Token / ArosCoin

## TokenService (layer 05)

- [x] Mint only after pot=1  
- [x] Double mint blocked  
- [x] Transfer requires pot  
- [x] Revaluation pro-rata  
- [x] Hydrate from journal  
- [x] Burn facts  
- [x] Unit tests (`src/token/*.spec.ts`)

## ArosCoin surface (C3)

**Code:** `src/aroscoin/aroscoin.service.ts` — thin canonical ARO API over `TokenService`.  
**No free mint** — all mint/transfer/revalue paths PoT-gated via TokenService.

- [x] symbol `ARO` / decimals `9`  
- [x] mintAfterPot fails without journal ok-to-emit  
- [x] mintAfterPot succeeds after pot_verdict verified=1  
- [x] burn + transferAfterPot  
- [x] revalueAfterPot (I9)  
- [x] hydrateFromJournal  
- [x] Dedicated unit tests `src/aroscoin/aroscoin.service.spec.ts`  

```bash
npm test -- --testPathPattern='token|aroscoin'
```
