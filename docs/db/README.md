# PostgreSQL index mirror

**Issue:** ENV #47  
**Role:** Query/index convenience only. **Not** source of truth.

- Schema: `postgres-index-schema.sql`  
- Compose: service `postgres` mounts this on init  
- Rebuild: wipe tables → replay NodeChain journal heights into `journal_index`

Never write economic truth only to Postgres.
