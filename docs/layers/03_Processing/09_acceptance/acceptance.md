# Acceptance — Processing (deep)

- [x] `process_open` + `process_stage` on journal at open  
- [x] FSM rejects invalid transitions (`stages.ts`)  
- [x] Terminal stages immutable (`closed` / `aborted`)  
- [x] `markPotDone` / `markSettled` / `close` happy path  
- [x] `close` shortcut from `pot_done`  
- [x] `abort` writes `process_abort` with reason (awaiting_pot and pot_done)  
- [x] Hydrate from journal after memory loss  
- [x] `hydrateAllFromJournal` multi-process rebuild  
- [x] Encoding failures wrapped as `PROC_ENCODING_FAILED`  
- [x] Double open rejected (memory + journal)  
- [x] Orchestrator/pipeline: settle then close; abort on PoT/L3 failure  
- [x] No mint/fee/PoT logic inside `src/processing`  
- [x] Tests  

```bash
npm test -- --testPathPattern='processing|process.service'
```
