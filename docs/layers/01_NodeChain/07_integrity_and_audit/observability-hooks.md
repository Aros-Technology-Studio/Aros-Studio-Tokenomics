# Observability hooks (for All-Seeing Eye and ops)

## Purpose

NodeChain emits a **read-only event stream** so the All-Seeing Eye and ops can observe the whole system’s ledger spine.

## Events (examples)

- `record_appended` { height, recordType, processId, writerId }  
- `append_rejected` { code, writerId, recordType }  
- `tip_advanced` { height, tipHash }  
- `snapshot_created` { atHeight, stateRoot }  
- `replication_lag` { replicaId, lagHeights }  
- `read_only_entered` / `read_only_exited`  

## Rules

1. Stream is **outbound only** from NodeChain’s perspective.  
2. All-Seeing Eye **subscribes**; it does not gain append rights via this channel.  
3. All-Seeing Eye hierarchy / AI agents / halt policy are **specified in All-Seeing Eye/governance docs**, not here.  
4. Presence of All-Seeing Eye as observer of NodeChain is expected and normal.

## Privacy

Event payloads should avoid raw sensitive document bytes; use ids and hashes.
