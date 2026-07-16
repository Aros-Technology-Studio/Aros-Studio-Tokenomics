# CONTRACT — `common`

**Status:** ready  

---

## Inputs / Outputs

Library module — no runtime network API. Consumers import barrel symbols.

---

## Provided surfaces (normative categories)

| Export group | Consumers |
|--------------|-----------|
| `money/*` via barrel | emission, commission, aroscoin, reserve |
| `ids/*` | orchestrator, all process modules |
| `errors/*` | all modules |
| `crypto/*` | nodes, pot, nodechain, state-recording |
| `logging/*`, `config/*` | all services |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| decimal.js or big.js | money |
| Node crypto / vetted libs | hash/verify |

| Depended on by | Why |
|----------------|-----|
| all `src/*` modules | shared primitives |

---

## Error / fail-closed paths

N/A as network service. Invalid use (domain logic in common) is a **review/CI architectural fail**.

---

## Related package

`testing/` — separate; not exported from common runtime barrel.
