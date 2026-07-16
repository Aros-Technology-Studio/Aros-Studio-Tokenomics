# CONTRACT — `all-seeing-eye`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| event stream | all modules / bus | yes | all events |
| InvariantBroken | invariants | yes | |
| ledger read | nodechain | yes | full history authorized for Eye |
| config enable flag | env | yes | false only dev/test |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| sync critical alert | ops + orchestrator | reason codes required |
| batch audit report | ops + NodeChain-anchored record | async |
| mirror rows | analytic store | not SoT |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `EyeAlert` | out | critical sync |
| `EyeAuditBatchCompleted` | out | async batch |
| `EyeObservationRecorded` | out | anchored observation |

**Forbidden outputs:** veto command, rollback command, mint/burn/pay calls.

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodechain` | SoT log + full read |
| event bus | observations |

| Depended on by | Why |
|----------------|-----|
| ops humans | alerts |
| `orchestrator` | may react operationally (not Eye executive power) |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| Eye down in prod | alert ops; **modules still fail-closed themselves** |
| Eye down in dev | optional disable |
| attempt to call economic API from Eye | hard ban / static check |
