# I4 — Logging (JSON stdout)

## Engineering

| Piece | Location |
|-------|----------|
| Logger | `src/common/json-log.ts` |
| Bootstrap | `src/main.ts` when `AST_LOG_JSON=1` |
| Prod default | `docker-compose.prod.yml` sets `AST_LOG_JSON=1` |

Ship stdout to Loki / ELK / CloudWatch with your agent. AST does not embed a log stack.

Example line:

```json
{"ts":"2026-07-30T12:00:00.000Z","level":"info","service":"ast-core","msg":"AST Nest core listening","port":3000}
```
