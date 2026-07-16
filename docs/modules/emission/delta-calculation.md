# Emission — Delta Calculation (§9.10)

**Code:** `src/emission`  
**Canon:** §9.10 Token supply change principle  
**Decisions:** P1 emission — institutional valuation + ΔValue  

---

## Live model

**Institutional valuation + ΔValue** replaces any legacy α·TV+β·U+γ style formula for v1 economic minting.

Output unit: **ARO** (or asset token units under the same protocol rules), floored to **9 decimals**.

---

## Canon formulas

On confirmed value **increase**:

```
new_supply = current_supply × (1 + ΔValue / previous_value)
```

On confirmed value **decrease**:

```
new_supply = current_supply × (1 − ΔValue / previous_value)
```

Implications:

| Case | Supply effect |
|------|----------------|
| Increase | Mint `new_supply − current_supply` (pro-rata I9) |
| Decrease | Burn `current_supply − new_supply` |
| Zero ΔValue | Policy: emit zero **or** burn path (asset policy) |

ΔValue and previous_value are from **confirmed institutional** packages, not internal appraisal.

---

## Rounding

- Use `decimal.js` via `src/common/money`.  
- **Floor** to arx (10⁻⁹ ARO) for mint/burn amounts.  
- Deterministic: same NodeChain inputs → same plan (I4).

---

## Caps

- Per **asset class** caps from config (canon/governance).  
- Exceeding cap → reject / fail closed (`EmissionCapped`).  
- Caps are not soft warnings for v1 economic path.

---

## Zero / non-positive ΔValue policy

| Asset policy | Behavior |
|--------------|----------|
| zero-emit | Plan mints **0**; may still record plan |
| burn path | Follow decrease formula / explicit burn policy |

Policy is keyed by `assetClassId` (see Emission MODEL). Policy changes require governance/canon path — not silent ops toggle in prod without process.

---

## Determinism requirements

Inputs that must be fixed before plan compute:

- processId + PoT verified proof  
- previous_value, ΔValue or absolute new valuation as defined by process type  
- current_supply and holder set snapshot identity  
- cap policy version  

If any required input is missing or ambiguous → **reject** (non-deterministic input gap).

---

## What emission does not compute

| Not computed here | Owner |
|-------------------|-------|
| fee = amount × feeRate | commission |
| reserveIndex | reserve metrics |
| velocity | velocity_tracker |
| PoT verified bit | pot |

---

## Plan artifact

`EmissionPlan` includes mint/burn totals, per-holder map (I9), processId, and hashes/refs of valuation inputs so NodeChain replay can re-derive the same plan.
