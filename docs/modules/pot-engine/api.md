# PoT Engine — API

**Code:** `src/pot` (`PotService`)  
**Canon:** §4.2  
**Constraint:** No amount math; no mint; NodeChain before emission consumers.

---

## Conceptual operations

### openConfirmation / submitEvidence

Open or attach evidence for `processId`.

**Input highlights**

- `processId`  
- `executionSnapshot: { hash, prevHash }`  
- `assignedValidatorIds`  
- `criteriaResult` (may be refined as validation proceeds)  

**Output:** status `pending` until terminal.

### submitValidatorConfirmation

Quorum validator attaches signature for the open process.

**Rules**

- Validator must be in assigned set.  
- 1 vote per institutional cert.  
- After terminal state, further submit → double-confirm error.

### evaluate / finalizeVerdict

Compute `verified` 0|1 from criteria + quorum + timeout.

**On success path (`verified = 1`)**

1. Append to NodeChain.  
2. Return verdict including `ledgerHeight` and `contentHash`.  
3. Signal ok-to-emit (**without amount**).

### getVerdict

Read current/final verdict for `processId`.

---

## Verdict DTO

```
PotVerdict {
  processId: string
  verified: 0 | 1
  status: 'pending' | 'expired' | 'verified' | 'rejected'
  failedCriteria?: ('P1'|'P2'|'P3'|'P4')[]
  reasonCodes?: Partial<Record<criteriaId, string>>
  ledgerHeight?: number
  contentHash?: string
  quorumRequired?: number
  quorumActual?: number
}
```

---

## Events

| Event | Meaning |
|-------|---------|
| `PotPending` | Confirmation open |
| `PotVerified` | `verified = 1` recorded in NodeChain |
| `PotExpired` | Timeout fail closed |
| `PotDoubleConfirmRejected` | Error path for Eye |

---

## Error codes

| Code | Condition |
|------|-----------|
| `POT_NOT_VERIFIED` | Downstream asked for emit without verified=1 |
| `POT_CRITERIA_FAILED` | One or more P1–P4 false |
| `POT_EXPIRED` | 15m timeout |
| `POT_DOUBLE_CONFIRM` | Second confirm after terminal |
| `QUALIFIED_SIGNATURE_REQUIRED` | Missing/invalid signature |
| `INVALID_PROCESS_ID` | Malformed id |
| `NODECHAIN_APPEND_FAILED` | Could not record verdict |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodes` | Validator identity / keys |
| `nodechain` | Append-only record, height, uniqueness support |
| `invariants` | Pre-write asserts |
| `common` | Errors, ids, crypto helpers |

| Depended on by | Why |
|----------------|-----|
| `emission` | Only after verified + NodeChain |
| `aroscoin` | Mint/burn gated by process confirmation |
| `commission` | Settlement on PoT |
| `orchestrator` | Lifecycle coordination |

---

## Explicit non-APIs

| Forbidden surface | Reason |
|-------------------|--------|
| `forceVerify(processId)` | Free/admin mint path |
| `setAmount` / fee calc | No amount math in pot |
| `revokeVerified` | Immutable after verified=1 |
| `eyeVeto` | Eye has no veto |

---

## Downstream contract

Callers of emission must pass:

- `processId` with `verified = 1`  
- NodeChain receipt fields (`ledgerHeight` / content hash)  

Missing either → fail closed. Double economic success on the same processId is rejected at pot and/or aroscoin double-mint guards.
