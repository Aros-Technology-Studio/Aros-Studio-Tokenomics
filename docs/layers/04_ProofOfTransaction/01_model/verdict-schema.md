# Verdict schema

Journal record type: `pot_verdict`

| Field | Type | Meaning |
|-------|------|---------|
| processId | string | Process bound |
| schemaVersion | string | `pot-verdict-1` |
| verified | 0 \| 1 | Binary only |
| reasonCodes | string[] | Empty iff verified=1 and no warnings |
| criteriaResult | object | P1–P4 booleans |
| quorum | { K, Q, confirmerCount, ok } | Quorum math |
| evidenceRecordId | string | Link to pot_evidence |
| evidenceHeight | number | |
| validatorIds | string[] | |
| confirmers | string[] | |
| tipHeight | number | Journal tip at evaluation |
| tipHash | string | |
| final | bool | true when verified=1 (cannot be superseded) |
| expired | bool | true if timeout path |

## Finality

- `verified=1` + `final=true` → **no second verdict** for same processId.  
- `verified=0` may be re-attempted only via **new processId** (or explicit non-final policy — v1: prefer new process after timeout).  
