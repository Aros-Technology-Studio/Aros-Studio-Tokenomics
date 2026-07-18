# Lifecycle

## Primary success

1. `open` → encode body → `process_open` + stages `encoded`, `awaiting_pot`
2. PoT layer runs (outside Processing)
3. `markPotDone` → `process_stage(pot_done)`
4. Token / commission / reserve (outside Processing)
5. `markSettled` → `process_stage(settled)`
6. `close` → `process_close`

## Failure

1. After open, if PoT rejects or L3 hard-fails: `abort(reason)` → `process_abort`
2. Terminal; further transitions throw `PROC_TERMINAL`

## Restart

`hydrate(processId)` rebuilds `ProcessState` from journal when memory is cold.
