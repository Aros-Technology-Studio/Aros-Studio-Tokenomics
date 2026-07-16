# CONTRACT — `pot`

**Status:** ready  
**Canon refs:** `CANON.md` §4.2; clarifications P0.2

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| processId | orchestrator / intake | yes | unique |
| ExecutionSnapshot | executor | yes | hash + prevHash |
| validator signatures | quorum validators | yes | qualified e-signature (КЭП) |
| criteriaResult | validation pipeline | yes | P1–P4 all required for success |
| assigned validator set | nodes / config | yes | defines N for M-of-N |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| verified 0\|1 | NodeChain + callers | final if 1 |
| status pending\|expired | orchestrator | service states |
| ok-to-emit signal | emission | **no amount** |
| error double-confirm | caller + Eye record | fail closed |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `PotPending` | out | confirmation open |
| `PotVerified` | out | verified=1 recorded in NodeChain |
| `PotExpired` | out | timeout fail closed |
| `PotDoubleConfirmRejected` | out | error path for Eye |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodes` | validator identity / keys |
| `nodechain` | append-only record, ledgerHeight, uniqueness |
| `invariants` | pre-write asserts |

| Depended on by | Why |
|----------------|-----|
| `emission` | only after verified + NodeChain |
| `aroscoin` | mint/burn gated by process confirmation |
| `orchestrator` | coordinates process lifecycle |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| quorum not reached before timeout | expired; fail closed; new processId for retry |
| criteria P1–P4 not all true | verified≠1; no emission |
| missing signature / snapshot | reject |
| double confirmation same processId | **error** + Eye-visible record |
| emission requested before NodeChain PoT | **forbidden** / fail closed |
| attempt to revoke verified | reject (immutable) |

Roles:

- **Executor** — prepares evidence / snapshot  
- **Validators (quorum)** — submit confirmation  
- **Orchestrator** — coordinates only; does not replace quorum  
