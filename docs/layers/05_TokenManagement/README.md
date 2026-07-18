# 05_TokenManagement

**Layer:** Token / ArosCoin (AST Token Protocol)  
**Code:** `src/token/`  
**Canon:** §VI Token Protocol, §9.10 supply change, I1–I2–I9  

## Role

Canonical **working projection** of ARO balances; every supply change is a journaled fact after **PoT verified=1**.

| Operation | Gate | Journal |
|-----------|------|---------|
| mint | pot=1 + height | `mint_fact` |
| burn | balance | `burn_fact` |
| transfer | pot=1 | `transfer_fact` |
| revaluation ΔValue | pot=1 | `revaluation_fact` + pro-rata |

## Properties

- 9 decimals, symbol ARO  
- Double-mint forbidden (memory + journal)  
- No free / admin mint  
- `hydrateFromJournal()` rebuilds balances from SoT  

## Layout

```
src/token/
  token.service.ts
  supply.ts          # revaluation math + pro-rata
  errors.ts
  types.ts
  *.spec.ts
```
