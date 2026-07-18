# 07_Reserve

**Layer:** AST own reserve  
**Code:** `src/reserve/`  
**Canon:** §4.4 selective custody, §9.2 reserveIndex, §9.3 informational price  

## Role

Hold **only AST’s own** funds (commission AST share). Track confirmed process volume → `reserveIndex = log10(1 + volume)`.

| Operation | Journal |
|-----------|---------|
| Accrue AST share | `reserve_accrual` |
| Partial release | `reserve_release` (child claim) |

## Layout

```
src/reserve/
  reserve.service.ts
  index-math.ts
  errors.ts
  types.ts
```
