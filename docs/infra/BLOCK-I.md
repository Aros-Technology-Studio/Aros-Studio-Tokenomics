# Block I — Infrastructure (engineering package)

**Status:** Engineering scaffolding done · live cluster cutover is **owner ops**  
**Law:** NodeChain journal remains SoT. Postgres / Redis / Kafka are **not** economic truth.  
**Stack decision (I6):** Keep **NestJS** core + portal edge (S1). No Spring rewrite planned.

---

## Items

| ID | Item | Engineering deliverable | Owner residual |
|----|------|-------------------------|----------------|
| **I1** | PostgreSQL index mirror | Compose profile · prod optional service · schema · B6 code | Enable `DATABASE_URL` in prod |
| **I2** | Redis | Compose profile · optional portal session store | Size / HA Redis |
| **I3** | Kafka / event out | Redpanda profile · HTTP/Kafka out bridge | Managed Kafka, consumers |
| **I4** | Logging | JSON stdout logger (`AST_LOG_JSON=1`) | Loki/ELK shipper |
| **I5** | Kubernetes | `deploy/k8s/*` skeleton | Cluster, ingress, secrets |
| **I6** | Spring vs Nest | `SPRING-DECISION-I6.md` — **S1 Nest** | Owner confirm if ever revisit |
| **I7** | Observability alerts | `/metrics` · example Prometheus rules | Alertmanager routing |

Rollup: this file · `COMPLETION-TRACK.md` §I.

---

## Quick start (local infra profiles)

```bash
# Postgres index mirror only
docker compose --profile with-postgres up -d postgres
export DATABASE_URL=postgres://ast:ast@127.0.0.1:5432/ast_index

# Full optional data plane
docker compose -f docker-compose.yml -f docker-compose.infra.yml \
  --profile with-postgres --profile with-redis --profile with-kafka up -d

# Core with mirror + JSON logs
export AST_LOG_JSON=1
export DATABASE_URL=postgres://ast:ast@127.0.0.1:5432/ast_index
npm run start:dev
```

Prod compose optional Postgres:

```bash
docker compose -f docker-compose.prod.yml --profile with-postgres \
  --env-file .env.production up --build -d
```

---

## Non-goals

- Replacing NodeChain SoT with SQL/Kafka  
- Full multi-region SRE platform in this package  
- Forced Spring migration  
