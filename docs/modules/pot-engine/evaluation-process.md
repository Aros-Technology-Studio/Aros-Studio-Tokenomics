# PoT — Evaluation Process

**Code:** `src/pot`  
**Canon:** §4.2  
**Defaults:** timeout 15m (§XII)  

---

## Roles

| Role | Responsibility |
|------|----------------|
| **Executor** | Prepares evidence / ExecutionSnapshot |
| **Quorum validators** | Submit confirmation signatures |
| **Orchestrator** | Coordinates lifecycle only; **does not** replace quorum |
| **NodeChain** | Records final verdict / evidence height |
| **Eye** | Observes double-confirm and failures (no veto) |

---

## Evidence package

Required evidence (P0 pot):

| Field | Notes |
|-------|-------|
| `processId` | Unique process identifier |
| `executionSnapshot` | `hash` + `prevHash` |
| `assignedValidatorIds` | Full assigned set N |
| `validatorIds` | Confirming subset |
| `signatures` | Qualified e-signature per confirmer |
| `criteriaResult` | P1–P4 booleans + reason codes |

PoT **does not** include mint amounts, fee rates, or valuation arithmetic.

---

## Lifecycle

```
open confirmation (pending)
  → collect validator signatures + evaluate criteria
  → either:
       verified = 1  (final)  → NodeChain append → ok-to-emit signal
       verified = 0  (rejected criteria / insufficient rules)
       expired       (timeout 15m) → fail closed; new processId to retry
  → never: revoke verified = 1
```

### Status values

| Status | Meaning |
|--------|---------|
| `pending` | Confirmation window open |
| `verified` | `verified = 1`, final |
| `rejected` | Criteria or validation failed (`verified = 0`) |
| `expired` | Timeout without success |

Service-level `PotServiceStatus` covers pending/expired; verdict also carries binary `verified`.

---

## Timeout

- Default **15 minutes** from confirmation open.  
- On timeout → `expired`, fail closed.  
- Retry requires a **new processId** (no reopen of the same id).  
- Orchestrator process timeout (30m) is a separate outer bound.

---

## Ordering: NodeChain before emission

Normative sequence after positive criteria + quorum:

1. Append PoT verdict / evidence to **NodeChain**.  
2. Only then emit `ok-to-emit` / allow emission module to proceed.  
3. Emission/aroscoin **must** refuse if ledger height / content hash for this process is missing.

Emission requested before NodeChain PoT record → **forbidden / fail closed**.

---

## Double confirmation

Second confirmation attempt for the same `processId` after a terminal outcome:

| Behavior | Required |
|----------|----------|
| Reject | **error** (e.g. `POT_DOUBLE_CONFIRM`) |
| Record | Eye-visible record of the attempt |
| Economic effect | None (no second mint path) |

This is fail-closed, not “idempotent success ack” for a second independent verification.

---

## Uniqueness and ordering

- **processId** uniqueness for open/closed PoT state.  
- **ledgerHeight** ordering of recorded verdicts.  
- Multi-node same institution: **1 vote total per institutional certificate** (canon §XII).

---

## Compensation boundary

- Compensation sagas may run **only before** `verified = 1` (orchestrator).  
- After `verified = 1`, the process is **not compensatable** by soft reverse.  
- Later economic correction requires a **new** confirmed process (new processId), not PoT rewrite.
