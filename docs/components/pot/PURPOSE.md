# PURPOSE — `pot`

**Status:** ready  
**Canon refs:** `CANON.md` §III.1, §4.2, §IX.1, §XI I1–I2  
**Code path:** `src/pot/` (maps to `proof_of_transaction_engine`)  
**Clarifications:** P0.2 canonical v1

---

## Why this exists

PoT is the **only gate** for origin and change of value. Without `verified = 1`, value does not arise, change, or become valid.

---

## Responsibility

- Owns: confirmation evidence model, M-of-N quorum verdict, `verified` finality, processId uniqueness checks, orchestration statuses (`pending` / `expired`), “ok → emission” signal.
- Contributes to: ordering via `ledgerHeight`; NodeChain append of verdict **before** emission.
- Does **not** own: amount calculation, institutional valuation, mint/burn execution, Eye veto (forbidden).

---

## Boundary (must not)

- Must not compute emission amounts (Emission Engine does).  
- Must not allow emission before NodeChain PoT record.  
- Must not revoke a `verified = 1` verdict.  
- Must not accept double confirmation of the same `processId` silently.  
- Must not let orchestrator replace validator quorum as confirmer.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Evidence: processId, ExecutionSnapshot (hash+prevHash), validatorIds, qualified e-signatures, criteriaResult P1–P4 | Mint/pay without verdict |
| M-of-N quorum (default 2/3 assigned validators) | Single-node “always trust” as v1 default |
| Binary verified 0\|1 + pending/expired | Soft revoke after verified |
| Final verified; expired → fail closed; retry new processId | Reuse processId after expired/verified |
| Quorum validators submit; executor prepares; orchestrator coordinates | Orchestrator self-verifies |
| NodeChain record before emission | pot calculates amounts |
| Double confirm → error + Eye-visible record | Ignore double confirm |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `nodes` | validators / identities |
| `nodechain` | append verdict, ledgerHeight, snapshots |
| `emission` | consumes ok signal; computes amount |
| `orchestrator` | coordinates only |
| `invariants` | I1/I2 asserts on write-path |
| `all-seeing-eye` | notified on double-confirm / breaches |
