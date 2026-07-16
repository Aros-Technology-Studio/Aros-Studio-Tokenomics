# CONTRACT — `invariants`

**Status:** ready  
**Canon refs:** `CANON.md` §XI; clarifications P0.1

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| `invariantId` | caller | yes | `I-ID-vX.Y` |
| `InvariantContext` | caller / NodeChain snapshot | yes | must be reproducible (I4) |
| registry version | config / canon semver | yes | frozen set until amendment |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| assert pass | caller continues | no side effect inside invariants module |
| assert fail | caller aborts | fail closed |
| NodeChain breach record | `nodechain` / `state-recording` | mandatory on fail |
| `InvariantBroken` | event bus → Eye, audit | no veto authority |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `InvariantBroken` | out | breach observed; for Eye + audit |
| `InvariantCheckAllCompleted` | out | periodic scan result summary |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodechain` / ledger | record fails; read causal context |
| Canon registry | I1–I9 definitions |

| Depended on by | Why |
|----------------|-----|
| all write-path modules | pre-side-effect asserts |
| `all-seeing-eye` | monitor events only |
| CI | one test per invariant ID |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| predicate false | fail closed; no side effect; NodeChain record; `InvariantBroken` |
| unknown / wrong version ID | fail closed |
| context incomplete | fail closed (cannot prove determinism) |
| Eye unavailable | still fail closed on assert fail; Eye is not required for stop |

API surface (normative names):

- `assertInvariant(id, ctx): void` — throws / Result error on fail  
- `checkAll(ctx): InvariantResult[]` — periodic  
- emit `InvariantBroken` on fail  
