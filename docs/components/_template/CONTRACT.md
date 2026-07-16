# CONTRACT — `<component-name>`

**Status:** draft | ready  
**Canon refs:** …

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| … | component / API / event | yes/no | … |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| … | … | … |

---

## Events (emitted / consumed)

| Event | Direction | Meaning |
|-------|-----------|---------|
| … | in / out | … |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| … | … |

| Depended on by | Why |
|----------------|-----|
| … | … |

---

## Error / fail-closed paths

Describe failure behavior without framing as punishment.  
All-Seeing Eye does **not** veto or roll back (`CANON.md` §4.3).

| Condition | Behavior |
|-----------|----------|
| invariant would break | fail closed / no side effects; Eye may notify |
| missing PoT or NodeChain record | invalid — operation must not complete |
| dependency unavailable | … |
