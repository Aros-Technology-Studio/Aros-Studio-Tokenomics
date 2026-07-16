# PURPOSE — `invariants`

**Status:** ready  
**Canon refs:** `CANON.md` §III, §X, §XI (I1–I9)  
**Code path:** `src/invariants/`  
**Clarifications:** `docs/COMPONENT_CLARIFICATIONS.md` §P0.1 (canonical v1)

---

## Why this exists

Holds the machine-checkable laws of AST so that no write-path can complete a side effect that would break Core Canon invariants I1–I9.

---

## Responsibility

- Owns: invariant registry (versioned IDs), pure predicates, write-path assert API, periodic `checkAll`, `InvariantBroken` events, CI mapping for each ID.
- Contributes to: fail-closed safety for all economic and ledger writes.
- Does **not** own: PoT verdicts, mint amounts, Eye policy, business workflows.

---

## Boundary (must not)

- Must not grant All-Seeing Eye veto or rollback.
- Must not introduce non-critical / soft invariants in v1.
- Must not allow side effects before a successful assert on the write-path.
- Must not invent invariants outside `CANON.md` §XI without formal canon amendment.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Pure checks + hard guards on every write-path | Rely on Eye alone for enforcement |
| Fail closed + NodeChain record on breach | Eye veto / rollback |
| Version IDs as `I-ID-vX.Y` + semver | Unversioned ad-hoc checks as “policy” |
| One automated CI test per invariant | Checklist-only for v1 |
| All invariants critical | Non-critical tiers in v1 |
| API: `assertInvariant` + `checkAll` + `InvariantBroken` | Admin override of asserts |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| all components | call `assertInvariant` before side effects |
| `nodechain` | records breach / assert outcomes |
| `all-seeing-eye` | consumes `InvariantBroken` (monitor only) |
| `pot` / `emission` / `aroscoin` / `reserve` | primary write-paths under I1–I9 |
