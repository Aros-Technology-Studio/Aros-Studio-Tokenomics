# CONTRACT — `release-daemon`

**Status:** ready  
**Canon refs:** §9.7; P2 release; P4.16  
**Code path:** `src/release-daemon/`

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| reserveIndex | reserve | yes | each tick |
| velocity | velocity-tracker | yes | each tick |
| release.threshold | config/env | yes | numeric |
| release.target | config/env | yes | numeric |
| governance readiness | release | yes for activate | release may reject |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| TickResult.met | ops / logs | thresholds satisfied |
| TickResult.activated | ops / logs | release accepted initiation |
| activateFromDaemon call | release | metrics payload |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `ReleaseDaemonTick` | out | metrics evaluated |
| `ReleasePhaseInitiationRequested` | out | called release |
| `ReleasePhaseInitiationDeferred` | out | met but governance/release rejected |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `reserve` | reserveIndex |
| `velocity-tracker` | velocity |
| `release` | activate path + governance |

| Depended on by | Why |
|----------------|-----|
| ops / process manager | schedule ticks |
| Eye | observation |

---

## API shape (implementation)

| Method | Behavior |
|--------|----------|
| `configure(threshold, target)` | set config |
| `tick()` | evaluate + maybe activate |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| metrics below thresholds | met=false; no activate |
| metrics met, governance not approved | met=true; activated=false |
| release throws / rejects | do not claim activated |
| missing config in prod | fail closed (do not invent thresholds) |

---

## Explicit non-goals

- Direct NodeChain append without release  
- Reverse phase  
- Partial asset release  
