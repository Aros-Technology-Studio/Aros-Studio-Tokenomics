# Index mirror

## Role

Optional **Postgres** (or in-process memory) mirror for queries, dashboards, institution filters.

## Rules

1. Mirror is **not** source of truth.  
2. Built by continuous upsert on append and/or full replay.  
3. Lag is allowed and measurable (`lagHeights` in status).  
4. On conflict, **primary journal wins**.  
5. Rebuild: wipe mirror → `replayFrom(nodechain)`.

## Implementation (B6)

| Piece | Path |
|-------|------|
| Interface | `src/index-mirror/index-mirror.ts` |
| Postgres | `src/index-mirror/postgres-index-mirror.ts` |
| Schema | `docs/db/postgres-index-schema.sql` |
| Ops HTTP | `GET/POST /v1/core/mirror/*` |
| CLI | `npm run mirror:status` · `mirror:replay` |
| Runbook | `docs/db/README.md` |

## Schema hint

Tables for process list, record type filters, institution id — convenience only.
