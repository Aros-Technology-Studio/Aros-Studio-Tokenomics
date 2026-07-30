# I1 — PostgreSQL index mirror (prod path)

See also `docs/db/README.md` (B6).

## Engineering

| Piece | Location |
|-------|----------|
| Schema | `docs/db/postgres-index-schema.sql` |
| Code | `src/index-mirror/*` |
| Local compose | `docker compose --profile with-postgres up -d postgres` |
| Prod compose | `docker-compose.prod.yml` profile `with-postgres` |
| Env | `DATABASE_URL` |

## Default prod recommendation

Enable Postgres mirror when dashboards need SQL query convenience:

```bash
export DATABASE_URL=postgres://ast:SECRET@postgres:5432/ast_index
# or compose profile with-postgres + POSTGRES_PASSWORD
```

Journal remains SoT. Mirror lag is allowed; rebuild via `npm run mirror:replay`.

## Owner residual

Managed Postgres, backups, network isolation.
