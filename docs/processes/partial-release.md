# Process: Partial release

**Canon / packs:** `partial-release`, orchestrator, aroscoin, reserve, release (I8)

## Rules

- Requester: holder (Portal) + institutional approval  
- Full new `processId` via Orchestrator  
- Same dust as ARO  
- Atomic: burn → reserve child record → remint (claim split)  
- Pre–Release Phase: internal only (`externalIntent` blocked until phase active)  
- Pro-rata flag recorded on NodeChain payload  

## API

`POST /v1/core/partial-release`
