# MODEL — `commission`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| FeeSchedule | Rate + rules per asset class | scheduleId |
| FeeAssessment | fee = f(valuation, schedule) | processId |
| Distribution | node shares + AST reserve share | processId |
| Waiver / Tier | optional reduction | institutionId + schedule |
| SettlementRecord | NodeChain-visible settlement | content hash |

---

## States and lifecycle

```
PoT verified
  → assess fee on valuation
  → apply waiver/tier
  → split (default 70/30 nodes/AST, configurable)
  → distributeNodePayment + reserve accrue
  → NodeChain records
```

---

## Formulas (intent)

```
fee = valuation × feeRate(schedule)
nodePool = fee × nodeShare        # default 0.70
astReserve = fee × reserveShare   # default 0.30
paymentToNode = weighted share of nodePool  # see CANON §9.5 shape
```

Exact weight function uses node participation weights from `nodes` / pot assignment.

---

## Invariants

| Rule | Effect |
|------|--------|
| I5 — payment only for confirmed work | no pre-PoT settle |
| I6 — AST share is own reserve | no client custody |
| NodeChain visibility | fail closed if cannot record |
