# Acceptance — 08_AllSeeingEye (C2)

**Code:** `src/all-seeing-eye/` · stream `src/event-stream/` · HTTP `src/core-api/eye.controller.ts`  
**Status:** v1 observe/notify + durable stream (B4) — checklist maps to real modules.  
**Law:** Core Canon — **no veto, no rollback, no mint, no executive append** as All-Seeing Eye.

Evidence:

```bash
npm test -- --testPathPattern='all-seeing-eye|durable-event'
# expect all-seeing-eye.service.spec + durable-event-log.spec green
```

---

## Documentation

- [x] Purpose / boundaries / non-goals (`00_scope/`)  
- [x] Observe/notify model (`01_model/observe-notify.md`)  
- [x] API surface (`03_api/api.md`)  
- [x] This acceptance depth (C2)

---

## Capabilities (observe + notify only)

| Check | Evidence |
|-------|----------|
| [x] `observe` records event with `at` timestamp | `AllSeeingEyeService.observe` |
| [x] `notify` = observe with default level info | `notify` |
| [x] In-process `history()` audit log | unit test length |
| [x] `subscribe` listeners invoked on observe | `listeners` array |
| [x] Levels: info / warn / critical | type `AllSeeingEyeNotification` |
| [x] Optional processId + payload | interface fields |
| [x] Orchestrator emits observe on pipeline | `orchestrator.service.ts` |

---

## Hard non-capabilities (must remain)

| Check | Evidence |
|-------|----------|
| [x] `veto()` always throws | unit test `/no veto/i` |
| [x] No rollback / unverify / mint methods on Eye | service surface |
| [x] No executive journal append as Eye role | Eye is not a NodeChain writer for economic truth |
| [x] Guard: no All-Seeing Eye executive | `no-all-seeing-eye-executive-guard` in CI |
| [x] HTTP API exposes `veto: false` | `CoreEyeController` capabilities |

---

## Durable observer stream (B4 integration)

| Check | Evidence |
|-------|----------|
| [x] Optional `EventStreamService` on construct | Nest factory wires stream |
| [x] observe publishes `eye.notification` | durable log type |
| [x] `observeDurable` awaits seq assignment | unit test `seq === 1` |
| [x] Stream payloads avoid raw document bytes | only `keys` of payload |
| [x] Resume poll API | `GET /v1/core/eye/stream?fromSeq=` |
| [x] In-process history still available | `GET /v1/core/eye/events` |
| [x] Health reports stream tip | `GET /v1/core/eye/health` → `streamTipSeq` |
| [x] Durable path failure must not break observe | catch on fire-and-forget publish |

---

## HTTP (Core)

| Route | Role | Acceptance |
|-------|------|------------|
| `GET /v1/core/eye/events` | In-process history filter by level | [x] |
| `GET /v1/core/eye/stream` | Durable page `{ events, nextSeq, tipSeq }` | [x] |
| `GET /v1/core/eye/health` | mode observe_notify, veto false | [x] |

No `POST` veto/rollback/mint under `/v1/core/eye/*`.

---

## Explicit non-goals (still true)

- Eye as product authority over mint/burn  
- Eye auto-halt of NodeChain (ops kill-switch is separate hardening)  
- Full multi-agent hierarchy product UI (vision; bus is enough for v1)  
- Kafka / multi-region bus (optional later; file/memory stream is v1 durable)

---

## Residual (honest)

- [ ] Optional SSE/WebSocket push (today: poll resume)  
- [ ] Cross-node fan-out of observer log (replication of JSONL)  
- [ ] Formal ops alerting integrations (PagerDuty/etc.)

---

## Sign-off

| Item | Result |
|------|--------|
| Unit tests | `all-seeing-eye` + `durable-event` |
| Canon guard | no executive Eye |
| C2 depth vs thin checklist | **Done** (this file) |
