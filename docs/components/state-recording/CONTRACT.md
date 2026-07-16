# CONTRACT — `state-recording`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| state payload | orchestrator / modules | yes | |
| processId | orchestrator | yes | |
| sensitive flag / fields | caller | when needed | encrypt before write |
| replay request | ops / CI | no | determinism tool |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| append to NodeChain | nodechain primary | SoT |
| index rows | Postgres mirror | non-SoT |
| query page | institution / Eye | scoped |
| replay report | caller | pass/fail |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `StateRecorded` | out | write-ahead succeeded |
| `StateRecordFailed` | out | fail closed path |
| `StateReplayCompleted` | out | determinism result |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodechain` | ledger append + encryption at rest |
| crypto helpers (`common`) | hash / encrypt |

| Depended on by | Why |
|----------------|-----|
| `orchestrator` | step 8 / write-ahead for steps |
| all write modules | fail closed if cannot record |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| append fail | **block** business action |
| missing processId | reject |
| redaction request | reject |
| cross-tenant query | deny |
