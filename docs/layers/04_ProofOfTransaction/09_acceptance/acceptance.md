# Acceptance — PoT layer (deep)

## Documentation

- [x] Full model: P1–P4, quorum, evidence, verdict, timeouts, uniqueness  
- [x] Ed25519 confirmer attestations  
- [x] Validator registry (active / suspended)  
- [x] Process-type stage catalog  
- [x] Pre-verdict challenges  
- [x] Process flow + diagrams  
- [x] Integration contracts  

## Implementation

- [x] Pure criteria + quorum modules  
- [x] Evidence builder from journal  
- [x] verify() with write-ahead evidence+verdict  
- [x] Timeout 15m module  
- [x] Double-confirm / already-final guard  
- [x] Ed25519 confirmer attestations (`KeyRegistry` required)  
- [x] Validator registry (suspend excludes from quorum)  
- [x] Process-type stage catalog (`process-types.ts`)  
- [x] Pre-verdict challenge open/close journal records  
- [x] ok-to-emit gate after verified=1  
- [x] No amount math in pot package  
- [x] Pipeline / Orchestrator pass `keys` into `verify`  
- [x] Unit tests: criteria, quorum, attest, timeout, validators, process-types, service  

## Commands

```bash
npm test -- --testPathPattern=pot
# expect ≥ 19 tests under src/pot
npm run check:canon
```
