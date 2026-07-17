# Index mirror

## Role

Optional **Postgres** (or search) mirror for queries, dashboards, institution filters.

## Rules

1. Mirror is **not** source of truth.  
2. Built by consuming journal events or async tail.  
3. Lag is allowed and must be measurable.  
4. On conflict, **primary journal wins**.  
5. Rebuild: wipe mirror → replay journal.

## Schema hint

Tables for process list, record type filters, institution id — convenience only.
