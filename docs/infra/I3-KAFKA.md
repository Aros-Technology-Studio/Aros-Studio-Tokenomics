# I3 — Kafka / event out

## Engineering

| Piece | Location |
|-------|----------|
| Redpanda (Kafka API) | `docker-compose.infra.yml` profile `with-kafka` |
| Fan-out bridge | `src/event-stream/event-out-bridge.ts` |
| Wire | journal append → observer stream → optional fan-out |

```bash
docker compose -f docker-compose.yml -f docker-compose.infra.yml \
  --profile with-kafka up -d redpanda

export AST_EVENT_OUT_KAFKA_BROKERS=127.0.0.1:9092
export AST_EVENT_OUT_KAFKA_TOPIC=ast.journal.events
# needs rpk or kcat on PATH for produce; or use HTTP:
export AST_EVENT_OUT_URL=http://127.0.0.1:9999/hooks/ast
```

Topic payload: JSON `{ source, not_sot, event }` — ids/hashes only.

## Residual

Managed Kafka, consumer groups, schema registry, ACLs.
