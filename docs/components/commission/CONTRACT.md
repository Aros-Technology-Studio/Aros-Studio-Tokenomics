# CONTRACT — `commission`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| processId + PoT verified | pot | yes | |
| valuation | institutional | yes | fee base |
| schedule / asset class | config | yes | multi-schedule |
| node weights / participants | nodes/pot | yes | |
| waiver/tier | config | no | |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| node ARO payments | aroscoin / settlement | post-factum |
| AST reserve accrual | reserve | own funds |
| SettlementRecord | nodechain | mandatory |

---

## Events / API names (normative)

| Name | Meaning |
|------|---------|
| `settleCommission` | assess + commit settlement for process |
| `distributeNodePayment` | pay node pool shares |
| `CommissionSettled` | event after NodeChain record |
| `CommissionDistributed` | event after node payments |

**Forbidden identifiers:** any name matching the vocabulary gate (see `.github/scripts/canon-gate.sh`); use payment/settlement wording only.

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `pot` | on-PoT timing |
| `nodes` | payees |
| `aroscoin` | ARO transfer/mint of payment units as designed |
| `reserve` | AST share |
| `nodechain` | visibility |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| settle before PoT | reject |
| cannot append NodeChain | fail closed (no silent off-chain settle) |
| unknown schedule | reject |
