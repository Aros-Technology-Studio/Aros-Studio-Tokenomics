# PoT timeouts

| Window | Default | Source |
|--------|---------|--------|
| Confirmation | **15 minutes** | Core Canon §XII |

Evaluation: `now - process_open.timestampUtc > timeoutMs` → `expired=true`, `verified=0`, reason `POT_TIMEOUT`.

## Module

Pure function — no I/O:

```ts
evaluateTimeout(openedAtUtc, nowMs, timeoutMs)
isWithinConfirmationWindow(openedAtUtc, nowMs?)
```

Configurable via `PotConfig.timeoutMs` on `PotService`.

Code: `src/pot/timeout.ts`
