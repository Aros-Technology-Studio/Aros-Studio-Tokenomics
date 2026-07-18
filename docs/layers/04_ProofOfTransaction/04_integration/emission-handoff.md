# Integration — emission / token

TokenService.mintAfterPot requires:

- `potVerified === 1`  
- `potLedgerHeight` from verdict  

Commission settle requires `potVerified === 1`.  

Neither layer re-evaluates P1–P4; they trust the journaled verdict.
