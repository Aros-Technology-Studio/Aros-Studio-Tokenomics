# CONTRACT — `emission`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| processId + PoT verified | pot/nodechain | yes | |
| institutional valuation | attested institutional input | yes | |
| ΔValue | confirmed change | yes for revaluation | |
| asset class policy / caps | config (canon-governed) | yes | |
| holder set for pro-rata | ledger/token state | yes for I9 mints | |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| mint/burn invocations | `aroscoin` | after PoT |
| EmissionPlan record | NodeChain | for replay |
| cap rejection | caller | fail closed |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `EmissionPlanned` | out | deterministic plan |
| `EmissionExecuted` | out | after aroscoin success |
| `EmissionCapped` | out | cap blocked |
| `EmissionZeroOrBurn` | out | policy path for non-positive Δ |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `pot` | verified gate |
| `nodechain` | inputs + records |
| `aroscoin` | mint/burn |
| `reserve` | as mint path requires |
| `invariants` | asserts |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| no PoT | reject |
| cap exceeded | reject / fail closed |
| non-deterministic input gap | reject |
| param change without governance | reject |
