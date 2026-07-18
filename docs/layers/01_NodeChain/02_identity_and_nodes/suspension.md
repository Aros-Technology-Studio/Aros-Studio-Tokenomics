# Suspension

## Soft suspension

Triggered by repeated timeouts, invalid signatures, or policy flags.

Effects:

- exclude from confirmer quorum / co-sign sets;  
- stop scheduling new work;  
- **24h grace** default before harder measures (configurable);  
- event `node_suspend` appended.

## Restore

- automatic after grace if health recovers, or  
- manual allowlist restore;  
- `node_restore` appended.

## Hard revocation

Fraudulent confirmation attempts or cert compromise:

- durable ban of identity material;  
- history remains on chain (immutable);  
- same key cannot re-enter as clean slate.

## What suspension is not

- Not seizure of earned ARO already retained  
- Not stake slash (no stake)  
- Not All-Seeing Eye “veto API” inside NodeChain — suspension is executed by nodes/identity services and **recorded** here
