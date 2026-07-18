# API — ProcessService

| Method | Description |
|--------|-------------|
| `open(input)` | Encode + journal open; state → `awaiting_pot` |
| `get(processId)` | In-memory state or undefined |
| `getOrHydrate(processId)` | Memory or rebuild from journal |
| `hydrate(processId)` | Force rebuild from journal |
| `markPotDone(processId, meta?)` | `awaiting_pot` → `pot_done` |
| `markSettled(processId, meta?)` | `pot_done` → `settled` |
| `close(processId)` | `pot_done` \| `settled` → `closed` |
| `abort(processId, reason)` | non-terminal → `aborted` |
| `list()` / `listByStage(stage)` | In-memory inventory |
| `recentTransitions(limit?)` | In-session transition log |
| `assertNotTerminal(processId)` | Guard for orchestrators |

Errors: `ProcessError` + `ProcessErrorCode` (`PROC_*`).
