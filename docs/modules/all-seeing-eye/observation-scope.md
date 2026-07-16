# All-Seeing Eye — observation scope

**Module:** `all-seeing-eye`  
**Code:** `src/all-seeing-eye/all-seeing-eye.service.ts`  
**Pack:** `docs/components/all-seeing-eye/MODEL.md`, `CONTRACT.md`

---

## Scope principle

```text
Observe ALL events (variable depth) → record → optionally alert
Never: veto | rollback | mint | burn | pay | initiate
```

Coverage is **global** (all modules / bus). Depth of payload inspection may vary by event class (critical vs informational), but the Eye must not be limited to “critical-only” with zero global coverage.

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| Observation | Seen event / state sample | `observationId` + content hash ref |
| Alert | Notification with reason code | `alertId` |
| ReasonCode | Standardized taxonomy | code enum / string catalog |
| AuditBatch | Async analysis unit | `batchId` |
| AnalyticMirror | Non-authoritative query copy | derived from NodeChain / event stream |

---

## Event sources

| Source | Examples |
|--------|----------|
| Process lifecycle | ProcessStarted, step completed, failed, expired, compensating |
| PoT | verified 0/1, double-confirm errors, timeout expired |
| NodeChain | Append failures visible to observers; full history read authorized for Eye |
| Invariants | `InvariantBroken` → critical |
| Nodes / reputation | suspend (grace, no slash), restore |
| Oracle Gateway | accept / ORACLE_QUORUM_FAILED |
| Emission / settlement | mint, settle success/fail (observe only) |
| Release | phase activate/deny, gate denied |
| Kill switch | read-only mode transitions |

Implementation hooks include Nest event listeners (e.g. `INVARIANT_BROKEN_EVENT`, `NODE_SUSPENDED_EVENT`, `NODE_RESTORED_EVENT`) plus explicit `observe(eventType, payload)`.

---

## Observation lifecycle

```text
event stream
  → observe (all events, variable depth)
      → critical? → sync alert (ops + orchestrator)
      → batch audit → NodeChain-anchored findings + analytic mirror
```

### In-process vs separate process

- **Logic:** `AllSeeingEyeService` (observe / notify / mirror).  
- **Deployment:** separate process in real environments so Eye downtime cannot be mis-wired as in-process veto hooks.  
- When Eye is down in **prod**: ops alert; **modules still fail-closed themselves**.  

---

## NodeChain vs analytic mirror

| Store | Role |
|-------|------|
| NodeChain | Sole source of truth; Eye may read full history; findings can be **anchored** as observations/audit records |
| Analytic mirror | Query convenience; lag target **≤ 30s**; **never** overrides NodeChain |

### Conflict rule

```text
mirror Contradiction NodeChain  →  NodeChain wins
```

Mirror lag hint in skeleton code documents the §XII 30s target; production mirror must meet that SLO.

---

## Depth policy (variable)

| Class | Depth |
|-------|--------|
| Critical (invariant break, double confirm, oracle fail-closed storms) | Full payload + immediate alert |
| Process terminal states | Structured fields (processId, status, reason codes) |
| Heartbeats / high-volume chatter | Sampled or summarized (still “observed” at coverage level) |

Depth configuration must not drop **all-event coverage** to zero for non-critical classes without product owner change.

---

## What observation is not

| Anti-pattern | Why |
|--------------|-----|
| Observation as gate before mint | Executing module gates; Eye is parallel |
| Eye signature required for PoT | PoT is validators + criteria |
| Eye “approve” before EndProcess | Forbidden executive coupling |
| Deleting observations to hide incidents | Append/audit integrity |

---

## Code surface (reference)

```text
observe(eventType, payload?)
notify(severity, reasonCode, message, payload?)
listObservations() / listAlerts()
setEnabled(enabled, env)  // prod cannot disable
mirrorLagHintMs()         // documents ≤30s target
```

No exports for mint, burn, pay, veto, or rollback. Static/CI checks should ban such APIs from this package.  
