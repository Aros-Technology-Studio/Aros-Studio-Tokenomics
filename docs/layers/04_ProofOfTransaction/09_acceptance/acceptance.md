# Acceptance — PoT layer

## Documentation

- [x] Full model: P1–P4, quorum, evidence, verdict, timeouts, uniqueness  
- [x] Process flow + diagrams  
- [x] Integration contracts  

## Implementation

- [x] Pure criteria + quorum modules  
- [x] Evidence builder from journal  
- [x] verify() with write-ahead evidence+verdict  
- [x] Timeout 15m  
- [x] Double-confirm / already-final guard  
- [x] Ed25519 confirmer attestations  
- [x] Validator registry (suspend excludes from quorum)  
- [x] Process-type stage catalog  
- [x] Pre-verdict challenge gate  
- [x] No amount math in pot package  
- [x] Unit tests for pass/fail/quorum/timeout/double/challenge/attest  
- [x] Pipeline mints only after verified=1  

## Commands

```bash
npm test -- --testPathPattern=pot
npm run check:canon
```
