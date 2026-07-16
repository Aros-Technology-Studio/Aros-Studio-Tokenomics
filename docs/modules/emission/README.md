# Module: Emission

**Code:** `src/emission`  
**Canon:** §5, §9.10, I1–I2, I7, I9  
**Decisions:** P1 emission  
**Pack:** `docs/components/emission/`

---

## Purpose

Emission turns **confirmed institutional valuation** (and confirmed ΔValue on revaluation) into a **deterministic mint/burn plan**, then invokes `aroscoin.mint` / burn paths. AST does **not** appraise assets; it records and applies institution-provided value.

---

## Responsibility

| Owns | Does not own |
|------|----------------|
| ValuationInput acceptance (institutional only) | Asset appraisal |
| ΔValue application per §9.10 | PoT quorum |
| Pro-rata holder distribution (I9) | Fee schedules |
| Caps / zero-Δ policies | Free mint |
| Calling aroscoin after PoT + NodeChain | Eye veto |

---

## Design summary

1. **Institutional valuation only** — no α·TV+β·U+γ live model.  
2. **ΔValue** drives supply change formulas (§9.10).  
3. **Floor** to 9 decimals (arx).  
4. **I9** — new emission pro-rata to current holders.  
5. **Calls `aroscoin.mint`** (and burn path) only after PoT verified and NodeChain inputs ready.  
6. **Zero ΔValue** → emit zero **or** burn per asset policy.  
7. Params only via **canon / governance**, not ad-hoc hotfixes.

---

## Documents in this folder

| File | Content |
|------|---------|
| [valuation-input.md](./valuation-input.md) | Institutional inputs and attestation |
| [delta-calculation.md](./delta-calculation.md) | §9.10 supply formulas |
| [pro-rata-distribution.md](./pro-rata-distribution.md) | I9 distribution map |
| [api.md](./api.md) | Plan/execute surface |

---

## Lifecycle

```
PoT verified + NodeChain inputs ready
  → compute EmissionPlan (deterministic)
  → cap check
  → aroscoin.mint / burn
  → NodeChain records (via aroscoin/nodechain)
```

---

## Forbidden

- Self-appraisal formulas as mint basis  
- Emission without PoT  
- Skipping pro-rata on value-up (I9)  
- Admin parameter change without governance  
- Eye-initiated emission  
