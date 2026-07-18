# Uniqueness

## processId

- One **final** positive verdict per `processId`.  
- Double `verify` after final `verified=1` → error `POT_ALREADY_FINAL` / `POT_DOUBLE_CONFIRM` (no second mint path).  

## Ordering

- Verdict is ordered by NodeChain `height`.  
- Emission must store `potLedgerHeight` and refuse mint without it.  

## Idempotency

- `clientRecordId` `pot-verdict:{processId}` makes journal append idempotent for the same verdict write.  
- Semantic double-confirm still blocked when a final verdict already exists with `verified=1`.  
