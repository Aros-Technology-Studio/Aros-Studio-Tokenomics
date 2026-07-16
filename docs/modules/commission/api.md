# Commission — API

**Code:** `src/commission` (`CommissionService`)  
**Canon:** §9.4–9.5  
**Normative names:** `settleCommission`, `distributeNodePayment`  

---

## Conceptual operations

### settleCommission

Assess fee for a verified process, apply schedule/waiver, split pools, commit settlement intent, and ensure NodeChain visibility.

**Inputs**

| Input | Required | Notes |
|-------|----------|-------|
| processId | yes | PoT verified |
| valuation base | yes | institutional |
| schedule / asset class | yes | multi-schedule |
| node weights / participants | yes | from nodes/pot |
| waiver/tier | no | config |

**Outputs**

- Settlement assessment + split  
- NodeChain SettlementRecord  
- Triggers or queues node distribution + AST reserve accrual  

### distributeNodePayment

Pay node pool shares to entitled participants (ARO payment units as designed).

**Inputs:** processId, nodePool ref, weight vector  
**Outputs:** per-node payment records + events  

May be invoked as part of settle or as a follow-up step; both paths require PoT and NodeChain rules.

---

## Events

| Name | Meaning |
|------|---------|
| `CommissionSettled` | After NodeChain record |
| `CommissionDistributed` | After node payments |

---

## Error codes / fail-closed

| Condition | Behavior |
|-----------|----------|
| settle before PoT | reject (`POT_NOT_VERIFIED`) |
| cannot append NodeChain | fail closed |
| unknown schedule | reject |
| invalid amount/rate | `INVALID_AMOUNT` / `INVALID_DECIMAL` |
| kill switch | `KILL_SWITCH_ACTIVE` |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `pot` | on-PoT timing |
| `nodes` | payees / weights |
| `aroscoin` | ARO transfer/payment units |
| `reserve` | AST share own funds |
| `nodechain` | visibility |
| `common` | money, errors |

---

## Explicit non-APIs

| Forbidden name / concept | Use instead |
|--------------------------|-------------|
| `claimPool`, `stakePayout` | `distributeNodePayment` |
| `harvestFees` | `settleCommission` |
| Eye `forcePayout` | not available |

---

## Pipeline position

```
… → PoT → NodeChain → Emission → Settlement (this module) → State → End
```

Settlement is post-factum relative to confirmed work. It does not gate the existence of PoT, but it must not complete off-ledger.
