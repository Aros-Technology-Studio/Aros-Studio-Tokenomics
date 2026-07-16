# MODEL — `invariants`

**Status:** ready  
**Canon refs:** `CANON.md` §XI, §X

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| InvariantDef | Named law with pure predicate | `I-ID-vX.Y` (e.g. `I-1-v1.0`) |
| InvariantContext | Inputs for evaluation (process, ledger, supply, custody flags) | derived from NodeChain + call args |
| InvariantResult | pass / fail + reason code | per assert |
| InvariantBrokenEvent | Audit/Eye signal | event id + invariant id + context hash |

---

## Canonical invariant set (v1, frozen until canon amendment)

| ID | Statement (from Core Canon §XI) |
|----|----------------------------------|
| I1 | Value arises only when `verified = 1` (PoT). |
| I2 | Every emission / burn is bound to a confirmed process. |
| I3 | Every significant event is recorded in NodeChain. |
| I4 | Determinism: same input → one result. |
| I5 | Earned is retained; speculative holding forbidden. |
| I6 | AST holds only its own funds. |
| I7 | Token always reflects current confirmed asset value. |
| I8 | Until Release Phase, circulation limited to internal roles. |
| I9 | New emission always pro-rata to current holders. |

Hard prohibitions in `CANON.md` §X are enforced as checks or structural absence of features (not soft policy).

---

## States and lifecycle

```
registered → asserted_on_write → pass | fail
fail → fail_closed (no side effect) → NodeChain record → InvariantBroken event
```

Periodic: `checkAll(ctx)` → set of results; any fail → same fail-closed path for subsequent writes; online hard gate for conservation-style rules + offline reconciliation job.

---

## Invariants of this module

| Rule | Effect if violated |
|------|---------------------|
| No write without assert coverage for applicable IDs | block release / CI fail |
| No non-critical path | reject definition |
| Version mismatch after canon bump without migration | fail closed until updated |

---

## Formulas / constants

None owned here. Predicates read canon constants and recorded process data from other modules.
