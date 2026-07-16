# CONTRACT — `release`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| reserveIndex | reserve / metrics | yes | |
| velocity | velocity tracker | yes | |
| threshold, target | config | yes | no code defaults mandated |
| governance approvals | governance | yes for transition | multi-step for large |
| reverse request | governance | no | deactivation |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| phase state | aroscoin / gates | circulation regime |
| PhaseTransition record | nodechain | prevStateHash + signatures |
| gate decisions | transfer/bridge adapters | allow/deny |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `ReleasePhaseActivated` | out | after NodeChain + governance |
| `ReleasePhaseDeactivated` | out | reverse path |
| `ReleaseGateDenied` | out | pre-phase external attempt |
| `ReleaseGateAllowed` | out | post-phase compliant action |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `reserve` | reserveIndex |
| metrics/daemon | velocity + initiate |
| `nodechain` | immutable phase events |
| `aroscoin` / adapters | gate enforcement |
| governance | approvals |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| external action pre-phase | deny |
| transition without governance | reject |
| transition without NodeChain record | reject |
| partial failure mid atomic release | full rollback of that op (module atomicity; not Eye) |
