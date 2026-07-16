# Commission — Fee Schedules

**Code:** `src/commission`  
**Canon:** §9.4, §9.9 (optional dynamic fee)  
**Decisions:** P1 commission — multi-schedule; sandbox feeRate example 0.15%  

---

## Fee formula

```
fee = tx.amount × feeRate
```

In process terms, `tx.amount` is the **valuation base** (institutional) for the process schedule, not a market mid-price invented by AST.

Optional dynamic form (§9.9):

```
dynamicFee = fee × (1 + overloadRate)
```

Dynamic fee is optional; enabling it is configuration/governance, not a silent code path for speculative pricing.

---

## FeeSchedule entity

| Field | Meaning |
|-------|---------|
| `scheduleId` | Identity |
| `feeRate` | Rate applied to base |
| asset class / process type rules | Matching |
| currency | ARO settlement units |
| waiver / tier hooks | Optional reductions |
| effective version | Governance-controlled |

Multi-schedule: different asset classes or process types may bind different schedules. Unknown schedule → reject settle.

---

## Defaults and examples

| Item | Value |
|------|-------|
| Sandbox example feeRate | **0.15%** (example, not sacred law) |
| Nodes / AST split | **70% / 30%** ship default (configurable) |
| Payment timing | **Post-factum** on PoT |

Numeric rates in prod are config; changing economic parameters outside governance is rejected.

---

## Waivers and tiers

| Mechanism | Effect |
|-----------|--------|
| Waiver | Reduce or zero fee for matched institution/process policy |
| Tier | Alternate rate table by volume/class tier |

Waivers must still leave an auditable assessment: original fee, adjusted fee, reason/policy id. They do not bypass PoT or NodeChain visibility.

---

## What fee schedules are not

| Not | Why |
|-----|-----|
| Staking APY table | Forbidden product vocabulary and model |
| Free mint schedule | Fees settle from process economics; free emission is forbidden |
| Custody fee on third-party funds | Selective custody: AST own funds only |
| Eye-imposed fine engine | Eye observes; does not collect via veto |

---

## Assessment artifact

`FeeAssessment` binds:

- processId  
- base valuation  
- scheduleId + feeRate  
- computed fee (decimal.js / floor rules as implemented)  
- waiver/tier adjustments  

Assessment feeds `settleCommission` only when PoT verified.
