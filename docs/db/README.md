# PostgreSQL index mirror (B6 · I1)

**Issue:** ENV #47 · Completion **B6** · Block **I1**  
**Role:** Query / dashboard convenience only. **Not** source of truth.  
**Infra rollup:** [`docs/infra/I1-POSTGRES.md`](../infra/I1-POSTGRES.md) · [`BLOCK-I.md`](../infra/BLOCK-I.md)

| Layer | Authority |
|-------|-----------|
| NodeChain journal (file / RocksDB) | **SoT** |
| Postgres `journal_index` | Secondary mirror (may lag) |

On conflict: **journal wins**. Rebuild by wipe + replay.

---

## Schema

- File: [`postgres-index-schema.sql`](./postgres-index-schema.sql)  
- Also applied at runtime by `PostgresIndexMirror.ensureSchema()` (idempotent)

Tables: `journal_index`, `process_summary`, `mirror_meta`.

---

## Local / prod wiring

### 1. Start Postgres (Compose profile)

```bash
cd /path/to/Aros-Studio-Tokenomics
docker compose --profile with-postgres up -d postgres
# wait healthy
export DATABASE_URL=postgres://ast:ast@127.0.0.1:5432/ast_index
```

### 2. Core with mirror

```bash
export DATABASE_URL=postgres://ast:ast@127.0.0.1:5432/ast_index
export AST_JOURNAL_ENGINE=file
export AST_JOURNAL_DIR=data/journal-pilot
npm run start:dev
# continuous upsert on each journal append (OBSERVER_MIRROR_WIRE)
```

Compose core service accepts `DATABASE_URL` from env when set.

### 3. CLI

```bash
npm run mirror:status    # lag, heights, kind memory|postgres
npm run mirror:replay    # TRUNCATE + full journal replay
npm run cli -- mirror process AST-DEMO-20260730-xxxxxxxxxxxx
```

Without `DATABASE_URL`, CLI uses **MemoryIndexMirror** (ephemeral).

### 4. HTTP (ops)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/v1/core/mirror/status` | lag / counts |
| POST | `/v1/core/mirror/replay` | full rebuild from NodeChain |
| GET | `/v1/core/mirror/processes/:processId` | query by process |

If `AST_OPS_READ_TOKEN` is set, send `X-Ops-Token`. If unset, open for local ops.

---

## Continuous ingest

On each successful journal append, Nest wires:

1. Observer event stream (B4)  
2. `mirror.upsert(record)` (B6)

Mirror lag is allowed; failed upsert does **not** fail SoT append.  
Catch-up: `POST /v1/core/mirror/replay` or `npm run mirror:replay`.

---

## Env

| Variable | Meaning |
|----------|---------|
| `DATABASE_URL` | Postgres URL → `PostgresIndexMirror`; else memory |
| `AST_OPS_READ_TOKEN` | Optional gate for `/v1/core/mirror/*` |

---

## Forbidden

- Writing economic truth **only** to Postgres  
- Treating mirror lag as journal corruption  
- Free mint / SoT rewrite via SQL  

## Code

- `src/index-mirror/*`  
- `src/core-api/mirror.controller.ts`  
- Wire: `layers.module.ts` → `OBSERVER_MIRROR_WIRE`  
