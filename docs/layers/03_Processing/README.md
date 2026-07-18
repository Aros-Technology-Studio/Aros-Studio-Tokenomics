# 03_Processing

**Layer:** Process lifecycle state machine  
**Code:** `src/processing/`  
**Role:** Own process stages and journaled `process_*` transitions. Hands `ProcessState` to PoT. **Does not mint, settle fees, or compute PoT.**

## Happy path

```
open (atomic) → awaiting_pot → pot_done → settled → closed
```

Open completes `opened → documents → encoded → awaiting_pot` in one call (encode + flags + journal).

## Fail path

```
awaiting_pot | pot_done | settled → aborted  (process_abort)
```

## Code surface

| API | Journal |
|-----|---------|
| `open` | `process_open` + `process_stage`(encoded, awaiting_pot) |
| `markPotDone` | `process_stage`(pot_done) |
| `markSettled` | `process_stage`(settled) |
| `close` | `process_close` |
| `abort` | `process_abort` |
| `hydrate` / `getOrHydrate` | rebuild from journal |

## Layout

```
src/processing/
  index.ts
  types.ts
  errors.ts
  stages.ts          # FSM edges
  process.service.ts
  process.service.spec.ts
```

## Invariants

1. **Fail-closed** — unknown processId / invalid transition throws `ProcessError`  
2. **Terminal** — `closed` and `aborted` accept no further transitions  
3. **Encode before open** — payloadHash always set via layer 02  
4. **No mint/fee/PoT inside this layer** — orchestrator (intake) calls other layers  
