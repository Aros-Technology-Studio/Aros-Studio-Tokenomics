# 06_FeeCommission

**Layer:** Post-factum settlement / node payment  
**Code:** `src/commission/`  
**Canon:** §9.4–9.5, ship split **70% nodes / 30% AST**

## Role

After PoT `verified=1`, charge fee on institutional valuation, split, credit nodes, return AST share for reserve accrual.

| API | Meaning |
|-----|---------|
| `settleCommission` | fee + split + distribute |
| `distributeNodePayment` | journal `payment_credited` + node balances |
| schedules | default / sandbox 0.15% / tiers |

## Rules

- No payment before PoT  
- One settlement per processId  
- Currency ARO  
- Hydrate from journal  

## Layout

```
src/commission/
  commission.service.ts
  schedules.ts
  weights.ts
  errors.ts
```
