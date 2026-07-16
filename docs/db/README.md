# Database — Postgres index mirror

**Role:** Secondary **index only** for queries and ops.  
**Not SoT:** NodeChain primary durable store (RocksDB-oriented / file / memory).  

## Schema

- SQL: [`postgres-index-schema.sql`](./postgres-index-schema.sql)  
- Runtime: `src/nodechain/postgres-index-mirror.ts` (`ensureSchema`, append mirror)

## Env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Full connection string (preferred) |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Discrete config |

If unset, mirror is disabled (no-op); primary ledger still works.

## Rules

- Never mint/burn/transfer from SQL  
- Never treat Postgres rows as validity without NodeChain height/hash  
- Institution read: own processes only (enforced at API layer)
