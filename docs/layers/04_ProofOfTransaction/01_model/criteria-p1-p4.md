# Criteria P1–P4

All four apply to **every** process type in v1.  
Positive verdict requires **all** true. Failure of any → `verified=0` with reason codes.

## P1 — Allowed architectural context

**Meaning:** Process initiated in an allowed context.

**Inputs (v1):**

- `institutionAllowlisted === true` on `process_open` payload  
- (Future) valid institutional certificate / КЭП binding  

**Fail codes:** `P1_INSTITUTION_NOT_ALLOWLISTED`, `P1_CONTEXT_INVALID`

## P2 — Full sequence of execution stages

**Meaning:** Required stages for the process type are completed.

**Inputs (v1 primary tokenization):**

- Required: `opened`, `documents`, `encoded`  
- Taken from process state `stagesCompleted` and/or journal `process_stage` records  

**Fail codes:** `P2_STAGES_INCOMPLETE`, `P2_STAGE_MISSING:<name>`

## P3 — Significant states recorded in NodeChain

**Meaning:** Material process facts already exist on the journal (write-ahead of process history).

**Inputs (v1):**

- At least one `process_open` for `processId`  
- Optional: expected stage records present  

**Fail codes:** `P3_STATES_NOT_RECORDED`, `P3_MISSING_PROCESS_OPEN`

## P4 — Process-type rules / deterministic completion preconditions

**Meaning:** Rules for this process type hold (docs, signature, valuation/holder present, etc.).

**Inputs (v1 primary tokenization):**

- `hasDocuments === true`  
- `hasQualifiedSignature === true`  
- non-empty `valuation` and `holderId`  

**Fail codes:** `P4_DOCUMENTS_MISSING`, `P4_SIGNATURE_MISSING`, `P4_VALUATION_MISSING`, `P4_HOLDER_MISSING`, `P4_PROCESS_RULES_FAILED`

## Conjunction

```
criteriaPass = P1 ∧ P2 ∧ P3 ∧ P4
```

No weighted average. No “almost pass.”
