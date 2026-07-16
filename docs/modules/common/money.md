# Common — Money

**Code:** `src/common/money` (`money.ts`)  
**Canon:** §XII min ARO dust; money library decimal.js  
**Decisions:** P0 aroscoin decimals; P1 emission floor 9 decimals  

---

## Units

| Symbol | Definition |
|--------|------------|
| ARO | Accounting unit |
| Decimals | **9** |
| arx | 10⁻⁹ ARO = `0.000000001` ARO |
| `ARO_DECIMALS` | `9` |
| `ARX_PER_ARO` | `10^9` |

Min dust (canon): **0.000000001** ARO (1 arx).

---

## Library

**decimal.js** is the ratified TypeScript money library. Do not mix ad-hoc IEEE floats for supply, fees, or ΔValue.

All cross-module amounts that cross API boundaries should be **decimal-safe strings** or Decimal instances converted at the edge.

---

## Core helpers

| Helper | Behavior |
|--------|----------|
| `floorToArx(amount)` | Floor to minimum ARO unit (arx); throws on NaN/non-finite |
| `parseDecimal(value)` | Parse string to Decimal; throws `INVALID_DECIMAL` class errors |
| `minDustAro()` | Returns dust Decimal |
| `isAtLeastDust(amount)` | Compare to dust floor |

Emission and commission must floor consistently so replay matches.

---

## Rounding policy (shared)

| Context | Mode |
|---------|------|
| Emission mint/burn amounts | **Floor** to arx |
| Fee assessment | decimal.js ops; floor/quantize as module specifies but never binary float |
| Dust on transfer split | reject or coalesce per config if below min |

Never round **up** supply on mint in a way that creates free units beyond plan.

---

## Error signals

| Code / throw | When |
|--------------|------|
| `INVALID_AMOUNT` | Non-finite / unusable amount |
| `INVALID_DECIMAL` | Parse failure |

Domain modules map these into `AstError` envelopes as needed.

---

## What money helpers must not encode

| Forbidden in common/money | Belongs in |
|---------------------------|------------|
| feeRate schedules | commission |
| ΔValue / §9.10 formulas | emission |
| “APY” or yield factors | nowhere (forbidden product) |
| Institutional appraisal | nowhere (AST does not appraise) |

---

## Testing

- Property: floor is idempotent for already-floored arx strings.  
- Dust boundary: `1e-9` accepted; below rejected by `isAtLeastDust`.  
- Spec file: `src/common/money/money.spec.ts`.  
