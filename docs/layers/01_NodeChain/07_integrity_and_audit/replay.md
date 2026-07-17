# Replay

## Definition

Replay means re-applying journal records from genesis or snapshot to rebuild state and verify tip.

## Guarantees

Same journal bytes → same `stateRoot` / derived views that are defined as pure functions of the journal.

## Procedure

1. Load snapshot optional.  
2. Apply records in height order.  
3. Verify signatures optional (full or sample).  
4. Compare tip hash and stateRoot.

## Failures

Mismatch → halt derived services; do not “fix” by rewriting journal.
