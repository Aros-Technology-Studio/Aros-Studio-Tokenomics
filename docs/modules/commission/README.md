# Module: Commission (Settlement)

**Code:** `src/commission`  
**Canon:** §9.4–9.5, §III.2, I5–I6  
**Decisions:** P1 commission  
**Pack:** `docs/components/commission/`  
**Alias:** settlement controller / settlement service names map here  

---

## Purpose

Commission assesses fees on confirmed process valuation and **settles post-factum** payments for executed work. Payment is **only after** PoT success. AST’s share accrues as **own funds** (selective custody); node share is distributed by weight.

This module uses **payment / settlement** vocabulary only — never yield, farming, or staking product language.

---

## Responsibility

| Owns | Does not own |
|------|----------------|
| Fee schedules (multi-schedule) | Asset appraisal |
| `fee = amount × feeRate` assessment | PoT criteria |
| `settleCommission` | Free mint of fee without process |
| `distributeNodePayment` | Eye payment veto |
| 70/30 default split (configurable) | Speculative holding products |
| NodeChain-visible settlement records | Third-party client custody |

---

## Design summary

1. **Base** = institutional valuation (or process amount base per schedule).  
2. **fee = amount × feeRate** (§9.4).  
3. **On PoT** — no pre-PoT settle.  
4. **Currency** ARO for settlement units.  
5. **Default split** 70% nodes / 30% AST reserve.  
6. **NodeChain visibility mandatory**.  
7. API names: `settleCommission`, `distributeNodePayment`.  

---

## Documents in this folder

| File | Content |
|------|---------|
| [fee-schedules.md](./fee-schedules.md) | Multi-schedule, waivers, sandbox rate |
| [settlement.md](./settlement.md) | Lifecycle, 70/30, §9.5 weights |
| [api.md](./api.md) | settle/distribute surface |

---

## Forbidden

- Pre-paid “yield” for unconfirmed work  
- Settlement without NodeChain record  
- Holding client third-party funds in commission pool as custody product  
- Banned yield vocabulary in APIs  
- Eye-initiated payouts  
