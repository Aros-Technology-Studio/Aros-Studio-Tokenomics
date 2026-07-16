# CONTRACT — `orchestrator`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| StartProcess request | institution / portal / internal | yes | sole economic entry |
| idempotencyKey | caller | yes | |
| documents + signatures | institution | yes for tokenize | |
| asset policy (approval, human flag) | config | yes | |
| Eye alerts | all-seeing-eye | no | ops reaction only |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| processId | caller + all steps | UUIDv7 + prefix |
| step invocations | pot, nodechain, emission, commission, … | ordered |
| compensation calls | prior step owners | on failure |
| technical logs | log sink | non-authoritative |
| business outcomes | NodeChain via modules | authoritative |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `ProcessStarted` | out | processId created |
| `ProcessStepCompleted` | out | step N done |
| `ProcessCompensating` | out | saga reverse |
| `ProcessFailed` | out | terminal fail after compensate |
| `ProcessEnded` | out | success terminal |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodes`, `pot`, `nodechain`, `emission`, `aroscoin`, `reserve`, `commission`, `state-recording`, `release` | pipeline |
| AI L1 (+ optional L2/L3) | real services |
| `invariants` | asserts on write paths of steps |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| missing idempotencyKey | reject |
| over concurrency limit | reject (or configured backpressure) |
| step fail | compensate prior steps; no partial economic success left dangling |
| timeout (process or step) | fail + compensate as needed |
| attempt to mint/settle outside orchestrator | forbidden (architecture) |
