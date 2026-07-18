# Reason codes

Stable machine codes. Always present on `verified=0`. May be empty on success.

| Code | Layer |
|------|--------|
| `P1_INSTITUTION_NOT_ALLOWLISTED` | P1 |
| `P1_CONTEXT_INVALID` | P1 |
| `P2_STAGES_INCOMPLETE` | P2 |
| `P2_STAGE_MISSING:*` | P2 |
| `P3_STATES_NOT_RECORDED` | P3 |
| `P3_MISSING_PROCESS_OPEN` | P3 |
| `P4_DOCUMENTS_MISSING` | P4 |
| `P4_SIGNATURE_MISSING` | P4 |
| `P4_VALUATION_MISSING` | P4 |
| `P4_HOLDER_MISSING` | P4 |
| `P4_PROCESS_RULES_FAILED` | P4 |
| `QUORUM_SHORT` | Quorum |
| `QUORUM_K_BELOW_MIN` | Quorum |
| `POT_TIMEOUT` | Timeout |
| `POT_DOUBLE_CONFIRM` | Uniqueness |
| `POT_ALREADY_FINAL` | Uniqueness |
| `POT_INVALID_INPUT` | Schema |
