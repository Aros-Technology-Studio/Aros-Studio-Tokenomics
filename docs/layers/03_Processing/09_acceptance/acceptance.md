# Acceptance — Processing

- [x] `process_open` + `process_stage` on journal at open  
- [x] FSM rejects invalid transitions  
- [x] Terminal stages immutable  
- [x] `markPotDone` / `markSettled` / `close` happy path  
- [x] `close` shortcut from `pot_done`  
- [x] `abort` writes `process_abort` with reason  
- [x] Hydrate from journal after memory loss  
- [x] Encoding failures wrapped as `PROC_ENCODING_FAILED`  
- [x] Double open rejected (memory + journal)  
- [x] Pipeline uses settle + abort on fail  
- [x] Tests  

```bash
npm test -- --testPathPattern='process.service|tokenization'
```
