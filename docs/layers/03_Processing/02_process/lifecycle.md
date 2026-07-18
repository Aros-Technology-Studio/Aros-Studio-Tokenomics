# Lifecycle

## Primary success (orchestrator)

1. `open` → encode body → `process_open` + stages `encoded`, `awaiting_pot`  
2. PoT layer runs **outside** Processing  
3. `markPotDone` → `process_stage(pot_done)`  
4. Token / commission / reserve run **outside** Processing  
5. `markSettled` → `process_stage(settled)` (lifecycle flag only)  
6. `close` → `process_close`  

## Failure

1. After open, if PoT rejects or L3 hard-fails: `abort(reason)` → `process_abort`  
2. Also allowed from `pot_done` / `settled` if post-PoT path fails  
3. Terminal; further transitions throw `PROC_TERMINAL`  

## Restart

- `hydrate(processId)` — rebuild one process from journal (height order)  
- `hydrateAllFromJournal()` — all `process_open` ids  
- `getOrHydrate` — memory first, else journal  

## Boundary

Processing **never** mints, settles fees, or evaluates PoT criteria.
