# Acceptance — TxEncoding

- [x] Deterministic hash independent of key order  
- [x] Schema per process type (`primary_tokenization`, `revaluation`, `ownership_transfer`)  
- [x] Reject floats / scientific amounts / extra keys / missing fields  
- [x] Invalid processId rejected (`AST-{INST}-{YYYYMMDD}-{suffix}`)  
- [x] Decode + hash verify  
- [x] Tamper detection  
- [x] Package ed25519 signature binding (`AST-TX-PACKAGE-v1`)  
- [x] Hash fields normalized lowercase  
- [x] Processing `ProcessService.open` uses `EncodingService`  
- [x] Intake reval/transfer bodies match schemas  
- [x] Tests green (`encode.spec` + pipeline consumers)  

```bash
npm test -- --testPathPattern='tx-encoding|process.service|pot.service|tokenization'
```
