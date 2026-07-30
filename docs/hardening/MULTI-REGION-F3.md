# F3 — Multi-region replication mesh

**Status:** Beyond catch-up · residual  
**Today:** `JournalReplicator.catchUpFrom` — peer segment must link to local tip; diverge = fail-closed.

## What exists

| Piece | Path |
|-------|------|
| Catch-up API | `src/nodechain/replication/journal-replicator.ts` |
| Tests | `journal-replicator.spec.ts` |
| Hardening note | `docs/HARDENING.md` #69 |

## Not multi-region mesh

- No automatic multi-writer BFT  
- No cross-region lag SLO dashboard  
- No automatic failover leader election  
- No geo-DNS journal primary election  

## Residual design (owner)

1. **One writer region** for SoT append (or explicit primary).  
2. Read replicas catch-up only (no fork merge).  
3. Backup journal snapshots to second region (F5 drill).  
4. Observe lag via metrics / mirror status.  

## Acceptance

| Check | Status |
|-------|--------|
| Catch-up fail-closed documented | ✅ |
| Mesh topology + runbooks | **Owner residual** |
