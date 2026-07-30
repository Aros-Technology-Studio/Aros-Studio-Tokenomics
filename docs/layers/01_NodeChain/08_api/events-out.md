# Events out API

```text
Subscribe(fromSeq?, fromHeight?, types[]?) → page { events, nextSeq, tipSeq }
```

Reliable consumers track **`nextSeq`** (exclusive resume cursor) and de-dupe by `seq` / `recordId`.  
At-least-once delivery.

## HTTP (Core Nest) — B4

| Call | Route |
|------|-------|
| Durable observer stream | `GET /v1/core/eye/stream?fromSeq=&fromHeight=&types=&limit=` |
| In-process Eye history | `GET /v1/core/eye/events?level=&limit=` |
| Eye health + stream tip | `GET /v1/core/eye/health` |

### Query params

| Param | Meaning |
|-------|---------|
| `fromSeq` | Resume after this sequence (default 0 = from start) |
| `fromHeight` | Only events with `height >= fromHeight` (journal-linked) |
| `types` | Comma-separated: `record_appended`, `tip_advanced`, `eye.notification`, … |
| `limit` | Max events (default 100, max 1000) |

### Event kinds (examples)

| type | Source |
|------|--------|
| `record_appended` | NodeChain after durable append (ids/hashes only) |
| `tip_advanced` | NodeChain tip move |
| `eye.notification` | All-Seeing Eye observe/notify |
| `append_rejected` | reserved / future |
| `read_only_entered` | reserved / future |

## Storage

| Env | Default |
|-----|---------|
| `AST_EVENT_STREAM_PATH` | `<AST_JOURNAL_DIR>/observer-events.jsonl` |
| `AST_EVENT_STREAM_PATH=memory` or `off` | in-process only |

Code: `src/event-stream/*` · Eye: `AllSeeingEyeService` · NodeChain hook: `setOnRecordAppended`.

## Rules

1. Stream is **outbound only** — no append API for clients / Eye.  
2. Eye **subscribes / polls**; does not gain journal write rights.  
3. Payloads avoid raw document bytes (hashes, ids, codes).  

See `07_integrity_and_audit/observability-hooks.md`.
