# Emission — Pro-Rata Distribution (I9)

**Code:** `src/emission`  
**Canon:** §VI.4, §9.10, invariant **I9**  
**Decisions:** P1 emission — pro-rata computed in emission  

---

## Invariant I9

> New emission is always distributed **pro-rata to current holders**.

Value-up mints **must not** allocate entire new supply to a single privileged account or to AST as “founders mint.”

---

## Computation ownership

| Step | Owner |
|------|-------|
| Compute pro-rata map | **emission** |
| Execute mint per claim | **aroscoin** |
| Record events | **nodechain** (via aroscoin path) |

Emission builds the map; aroscoin enforces process gates per mint leg.

---

## Pro-rata rule (intent)

For total mint amount `M` and holders with balances `b_i` where `S = Σ b_i = current_supply`:

```
mint_i = floor_arx( M × (b_i / S) )
```

Residual dust after floor:

- Coalesce per config (e.g. largest remainder or process-defined dust policy)  
- Never leave unallocated supply outside the plan without an explicit residual rule recorded in the plan  

Burns on value-down are likewise allocated pro-rata unless process type defines a different **confirmed** burn schedule that still preserves I7 (token reflects confirmed value) and auditability.

---

## Holder set snapshot

- Taken from canonical token state / ledger views at plan time.  
- Snapshot identity (hash or height ref) stored on `EmissionPlan` for replay.  
- Changing holders after snapshot without a new process does not rewrite an executed plan.

---

## Primary tokenization vs revaluation

| Process | Pro-rata? |
|---------|-----------|
| Primary tokenization (initial mint) | Initial allocation per institutional package / process rules (may be single claim or defined split) |
| Value-up revaluation (new emission) | **I9 pro-rata to current holders** |
| Value-down | Burn path per plan; must remain deterministic |

I9 specifically constrains **new emission** on confirmed increase relative to existing holders.

---

## Fail closed

| Condition | Behavior |
|-----------|----------|
| Value-up plan without pro-rata map | Reject (I9) |
| Map sums ≠ planned mint (beyond dust rule) | Reject |
| Unknown holder claims | Reject |
| Replay mismatch | Fail closed / audit alert (Eye observes) |

---

## Relation to commission

Node payments (70/30 commission split) are **settlement**, not I9 emission. Do not conflate fee distribution with pro-rata revaluation mints.

---

## Testing expectations

- Same inputs → same `mint_i` map.  
- Floor does not create inflation beyond `M` after residual rule.  
- I9 unit tests in emission + e2e tokenization flow coverage.  
