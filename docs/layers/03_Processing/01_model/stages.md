# Stages

| Stage | Meaning |
|-------|---------|
| `opened` | `process_open` written |
| `documents` | docs + signature flags captured on open |
| `encoded` | `payloadHash` + canonical package attached |
| `awaiting_pot` | ready for layer 04 |
| `pot_done` | orchestrator recorded successful PoT hand-off |
| `settled` | mint/fee/transfer economic path done |
| `closed` | terminal success |
| `aborted` | terminal failure (`process_abort` + reason) |

## FSM edges

```
opened → documents → encoded → awaiting_pot → pot_done → settled → closed
                                    ↘ aborted ←───────────┘         ↑
                         pot_done ───────────────────────────────→ closed  (shortcut)
```

- `open` lands on `awaiting_pot` with completed prefix stages.
- `close` allowed from `pot_done` or `settled`.
- `abort` allowed from any non-terminal stage.
