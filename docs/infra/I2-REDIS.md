# I2 — Redis (sessions / cache — not SoT)

## Engineering

| Piece | Location |
|-------|----------|
| Compose | `docker-compose.infra.yml` profile `with-redis` |
| Portal dual-write | `portal/backend/src/common/redis-session-store.ts` |
| Env | `REDIS_URL=redis://127.0.0.1:6379` |

```bash
docker compose -f docker-compose.yml -f docker-compose.infra.yml \
  --profile with-redis up -d redis
export REDIS_URL=redis://127.0.0.1:6379
# restart portal edge
```

Sessions still resolve from process memory; Redis is best-effort dual-write for ops / future multi-replica (use sticky sessions until async resolve lands).

## Residual

HA Redis, TLS to Redis, full shared-session multi-replica.
