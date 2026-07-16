# Commission — Settlement

**Code:** `src/commission`  
**Canon:** §9.4–9.5, §III.2 (payment only post-factum)  
**Decisions:** P1 commission  

---

## Lifecycle

```
PoT verified
  → assess fee on valuation (schedule)
  → apply waiver/tier
  → split (default 70% nodes / 30% AST)
  → distributeNodePayment + AST reserve accrue
  → NodeChain SettlementRecord (mandatory)
```

Settle **before** PoT → reject.  
Cannot append NodeChain → **fail closed** (no silent off-chain settle).

---

## Split formulas

```
fee = valuation × feeRate(schedule)
nodePool = fee × nodeShare        # default 0.70
astReserve = fee × reserveShare   # default 0.30
```

AST share → **own reserve** books (I6).  
Node pool → weighted distribution.

### Node payment (§9.5 shape)

```
paymentToNode = (node_weight_in_tx × tx.fee) / Σ(node_weights)
```

Exact weight function uses participation weights from `nodes` / pot assignment for the process. Unassigned free-riders receive nothing.

---

## Post-factum principle

- Work is paid **only after** confirmed execution (PoT).  
- No pre-funded yield streams.  
- If mint succeeded earlier in pipeline and settlement fails → **retry settlement** (do not burn-compensate mint) — §XII.

---

## NodeChain visibility

| Requirement | Rule |
|-------------|------|
| SettlementRecord | Mandatory on NodeChain |
| Content hash linkage | processId + assessment refs |
| Client/institution visibility | Own process settlement facts |
| Eye | Observes settlement events; cannot veto payout |

Failure to record = settlement not final.

---

## Distribution engine

v1 includes a **full simple distribution engine**:

1. Compute nodePool.  
2. Load weights for validators/executors entitled on this process.  
3. Allocate `paymentToNode` with decimal floor rules.  
4. Accrue AST share to reserve.  
5. Emit events after durable records.

Multi-node same institution still respects vote/participation rules from nodes pack for **weights used in payment** as configured (payment is for executed work, not for stake).

---

## Vocabulary (normative)

| Allowed API / docs words | Forbidden |
|--------------------------|-----------|
| settle, settlement, commission, fee, payment | passive pool schemes, farming schemes, APY tables |
| distributeNodePayment | harvest, claimPayouts |
| post-factum payment | passive income without execution |

Align with repository canon-gate scripts.

---

## Error matrix

| Condition | Behavior |
|-----------|----------|
| settle before PoT | reject |
| cannot append NodeChain | fail closed |
| unknown schedule | reject |
| zero weights with positive nodePool | fail closed / policy error |
| kill switch | reject new settlements |
