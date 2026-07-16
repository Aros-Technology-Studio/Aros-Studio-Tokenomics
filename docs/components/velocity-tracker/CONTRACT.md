# CONTRACT — `velocity-tracker`

**Status:** ready  
**Canon refs:** §9.6; P2 release; P4.16  
**Code path:** `src/velocity-tracker/`

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| processVolume_24h | NodeChain-derived confirmed volume | yes | UTC window |
| circulatingSupply | aroscoin / ledger projection | yes | > 0 for non-zero velocity |
| delta volume | process settlement hooks | optional | incremental add |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| velocity() | release-daemon, release | number / decimal |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `VelocityUpdated` | out | optional audit when volume/supply changes |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| money/decimal utils | precise division |
| (target) nodechain / aroscoin projections | real inputs |

| Depended on by | Why |
|----------------|-----|
| `release-daemon` | gate metric |
| `release` | phase evaluation |

---

## API shape (implementation)

| Method | Behavior |
|--------|----------|
| `setVolume24h(v)` | replace window volume |
| `addVolume(delta)` | increment |
| `setCirculatingSupply(v)` | set supply |
| `velocity()` | volume/supply; 0 if supply ≤ 0 |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| supply ≤ 0 | velocity = 0 (no false “target met”) |
| incomplete feed in prod wiring | do not claim phase metrics green |
| negative inputs | reject |

---

## Explicit non-goals

- Activating Release Phase  
- Computing reserveIndex  
- Public market price feeds as velocity definition  
