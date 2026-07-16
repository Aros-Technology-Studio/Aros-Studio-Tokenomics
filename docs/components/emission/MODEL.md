# MODEL — `emission`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| ValuationInput | Confirmed institutional valuation | ref + processId |
| DeltaValue | Confirmed change in asset value | signed amount + processId |
| EmissionPlan | Computed mint/burn amounts + pro-rata map | processId |
| CapPolicy | Per asset-class limits | assetClassId |
| AssetPolicy | zero-emit vs burn on non-positive delta | assetClassId |

---

## States and lifecycle

```
PoT verified + NodeChain inputs ready
  → compute plan (deterministic)
  → cap check
  → aroscoin.mint / burn path
  → NodeChain records (via aroscoin/nodechain)
```

---

## Math (normative intent)

- Live model: **institutional valuation + ΔValue** (not α·TV+β·U+γ).  
- Rounding: **floor** to 9 decimal places (arx).  
- Value-up supply change aligns with `CANON.md` §9.10; **emission** computes pro-rata (I9) then calls mint.  
- Zero/negative ΔValue: **emit zero** or **burn path** per asset policy.

---

## Invariants

| ID | Rule | Effect |
|----|------|--------|
| I1 | no plan without verified process | fail closed |
| I2 | every mint/burn bound to process | fail closed |
| I9 | value-up distribution pro-rata | fail closed |
| local | replay(same inputs)=same plan | fail closed |
