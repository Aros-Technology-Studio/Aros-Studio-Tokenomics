# E3 — Managed data-plane cutover

**Goal:** Optional Postgres / Redis / event-out enabled for production **without** making them SoT.  
**Builds on:** Block I · `docs/infra/*`

---

## Options

| Service | Env | Compose / notes |
|---------|-----|-----------------|
| Postgres index mirror | `DATABASE_URL` | prod profile `with-postgres` |
| Redis session dual-write | `REDIS_URL` | infra profile `with-redis` |
| Event out HTTP | `AST_EVENT_OUT_URL` | webhook receiver |
| Event out Kafka | `AST_EVENT_OUT_KAFKA_BROKERS` | needs rpk/kcat or managed Kafka |
| JSON logs | `AST_LOG_JSON=1` | ship stdout to Loki/ELK |

Journal SoT path: `AST_JOURNAL_DIR` on durable volume + backup.

---

## Recommended prod compose

```bash
# secrets preflight first
npm run cutover:preflight

docker compose -f docker-compose.prod.yml --profile with-postgres \
  --env-file .env.production up --build -d

# optional local data plane for hybrid home deploy:
# npm run infra:up
```

After Core is up:

```bash
export DATABASE_URL=…   # if mirror enabled
npm run mirror:status
# catch-up if needed:
npm run mirror:replay
```

---

## Checklist

| # | Step | Done |
|---|------|------|
| 1 | Journal volume durable + backup plan | |
| 2 | `DATABASE_URL` only if SQL dashboards needed | |
| 3 | Mirror lag understood; replay path known | |
| 4 | Redis only assist — sticky sessions if multi-replica | |
| 5 | Event out optional; failures never block append | |
| 6 | `AST_LOG_JSON=1` + log shipper | |

---

## Acceptance

| Check | Evidence |
|-------|----------|
| Docs | this file · I1–I4 |
| Prod compose profile | `docker-compose.prod.yml` |
| Managed cloud DBs | **Owner** |
