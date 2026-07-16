# CONTRACT — `aroscoin`

**Status:** ready  
**Canon refs:** `CANON.md` §VI; clarifications P0.4

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| ok-to-emit + amount DTO | emission (after pot) | yes for mint | no admin path |
| processId, claimId | process pipeline | yes | processId primary |
| institutional rate/valuation ref | manual institutional input | yes for mint | oracle = transport only |
| reserve lock proof | reserve service | yes | hard fail if missing |
| transfer intent | internal participant | for transfer | must pass PoT |
| burn/remint request | release / reassignment process | for burn | new process for remint |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| mint/burn/transfer receipt | client **after** NodeChain | strict ordering |
| NodeChain events | nodechain | before ack |
| mirror calls | Solidity adapter | double-mint guard |
| InvariantBroken | bus | on assert fail |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `AroMinted` | out | after NodeChain append |
| `AroBurned` | out | after NodeChain append |
| `AroTransferred` | out | permissioned internal |
| `AroDoubleMintRejected` | out | both layers guard |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `pot` | verified process |
| `emission` | amounts / valuation-driven deltas |
| `reserve` | lock / bag |
| `nodechain` | record before ack |
| `invariants` | write-path asserts |

| Depended on by | Why |
|----------------|-----|
| `orchestrator` | lifecycle |
| `release` | circulation regime |
| adapters | external representation |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| mint without PoT/emission | reject forever |
| admin mint attempt | reject forever |
| double mint | fail closed (TS + Solidity) |
| reassign without burn+remint | reject |
| NodeChain write fail | no client ack |
| transfer without PoT / pre-Release external | reject |
| dust below min on split | reject or coalesce per config |

Ack rule: **NodeChain success → then client ack** (never reverse).
