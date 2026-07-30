# API — All-Seeing Eye

## In-process service

**Code:** `src/all-seeing-eye/all-seeing-eye.service.ts`

| Method | Description |
|--------|-------------|
| `observe` | Record observation (+ optional durable publish) |
| `observeDurable` | Await durable `eye.notification` seq |
| `notify` | Observe with alert intent (default level info) |
| `subscribe` | Register in-process listener |
| `history` | In-memory audit log |
| `veto` | **Always throws** — no veto capability |

Constructor may take `EventStreamService` (B4).

## HTTP (Core Nest)

**Code:** `src/core-api/eye.controller.ts`  
**Base:** `/v1/core/eye`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events?level=&limit=` | In-process history |
| GET | `/stream?fromSeq=&fromHeight=&types=&limit=` | Durable observer stream (resume) |
| GET | `/health` | `mode: observe_notify`, `veto: false`, `streamTipSeq` |

## Capabilities object (events response)

```json
{
  "observe": true,
  "notify": true,
  "veto": false,
  "rollback": false,
  "mint": false,
  "durableStream": true
}
```

## Forbidden endpoints

No Eye-owned: veto, rollback, mint, free journal rewrite.
