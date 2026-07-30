# Observe / notify

## In-process

- `observe(level, source, code, message, processId?, payload?)`  
- `notify` = observe with intent to alert (default level `info`)  
- `history()` — audit of All-Seeing Eye log (memory)  
- `subscribe(fn)` — in-process listeners  
- `veto()` always throws  

## Durable (B4)

- Optional `EventStreamService` on the service  
- observe also publishes type `eye.notification`  
- `observeDurable` awaits sequence number  
- Resume: `GET /v1/core/eye/stream?fromSeq=`  
- Payload to stream: **no raw document bytes** (key names only)

## Non-capabilities

| Action | Allowed? |
|--------|----------|
| Observe / notify / history | Yes |
| Veto / rollback / mint | **Never** |
| Rewrite NodeChain SoT | **Never** |

Acceptance: `09_acceptance/acceptance.md` (C2).
