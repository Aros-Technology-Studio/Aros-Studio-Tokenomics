# Verify flow

```text
1. Load process + journal history for processId
2. Reject if final verified=1 already exists
3. Build evidence (tip, stages, flags, heights)
4. Evaluate P1–P4 → criteriaResult + reasonCodes
5. Evaluate timeout from process_open time
6. Evaluate quorum(confirmers, validatorIds)
7. verified = (criteria ∧ quorum ∧ ¬timeout) ? 1 : 0
8. Append pot_evidence (write-ahead)
9. Append pot_verdict
10. Return PotVerdict { verified, heights, codes, … }
```

No amount fields at any step.
