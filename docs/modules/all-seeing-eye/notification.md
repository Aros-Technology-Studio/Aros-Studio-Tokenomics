# All-Seeing Eye — notification

**Module:** `all-seeing-eye`  
**Canon:** §4.3  
**Decisions:** P1 — async batch + critical sync alerts; reason codes required  

---

## Dual channel model

| Channel | Mode | Audience | Use |
|---------|------|----------|-----|
| Critical alert | **Synchronous** (immediate) | Ops humans + Orchestrator | Incidents needing awareness now |
| Audit batch | **Asynchronous** | Ops + NodeChain-anchored report | Systematic review, trends, non-urgent findings |

Silent-only or sync-only designs are non-conformant: both channels exist in v1.

---

## Alert structure

| Field | Required | Notes |
|-------|----------|-------|
| `alertId` | yes | Stable id for correlation |
| `severity` | yes | At least `critical` \| `info` (extensible) |
| `reasonCode` | yes | Standardized taxonomy — **not** free-text alone |
| `message` | yes | Human-readable summary |
| `at` | yes | ISO-8601 **UTC** |
| `payload` | no | Structured context (processId, invariant id, …) |

### Reason codes (required)

Free-text-only alerts are forbidden as the sole signal. Codes enable automation, dashboards, and runbooks.

Illustrative catalog (engineering expands; pack notes catalog as open item):

| Code | Typical meaning |
|------|-----------------|
| `E_INVARIANT_BROKEN` | Invariant assert failed |
| `E_NODE_SUSPENDED` | Node suspended (grace; no slash) |
| `ORACLE_QUORUM_FAILED` | Oracle gateway fail-closed (may also be process reason) |
| `E_POT_DOUBLE_CONFIRM` | Double confirm attempt |
| `E_PROCESS_EXPIRED` | Process timeout / expired path |
| `E_RELEASE_GATE_DENIED` | Pre-phase external attempt blocked |
| `E_MIRROR_LAG` | Analytic mirror lag exceeds 30s SLO |

Classification rules (what is critical vs info) are product-configurable; mechanism is fixed: critical → sync, rest → batch and/or info.

---

## Fan-out

```text
EyeAlert
  → ops human channels (Pager/email/chat — ops binding)
  → orchestrator / ops reaction surface
  → observation log (alert itself is observed)
```

### Orchestrator consumption

Orchestrator may:

- Surface alerts to operators  
- Align with kill switch / intake pause **under human or policy control**  

Orchestrator must **not** treat an Eye alert as a PoT verdict or as automatic economic reverse. Compensation remains saga rules only ([orchestrator/saga-compensation.md](../orchestrator/saga-compensation.md)).

---

## Sync critical path

```text
InvariantBroken (or other critical event)
  → notify('critical', reasonCode, message, payload)
  → immediate fan-out
  → record observation
```

Fail-closed on the **write path** still happens inside the executing module **before or independent of** Eye delivery. Eye outage must not leave the system open.

---

## Async batch path

```text
windowed event stream
  → AuditBatch analysis
  → findings (+ optional NodeChain-anchored summary)
  → EyeAuditBatchCompleted
  → mirror rows for query
```

Batches must not become a back-channel for executive commands.

---

## Events (out)

| Event | Meaning |
|-------|---------|
| `EyeAlert` | Critical (or severity-tagged) sync notification |
| `EyeAuditBatchCompleted` | Async batch finished |
| `EyeObservationRecorded` | Anchored / stored observation |

### Forbidden outputs

| Output | Status |
|--------|--------|
| Veto command | **Forbidden** |
| Rollback command | **Forbidden** |
| mint / burn / pay calls | **Forbidden** |
| “Force verified=0” | **Forbidden** |

---

## Delivery failure

| Condition | Behavior |
|-----------|----------|
| Alert channel down | Retry/ops escalation; do not block ledger appends via Eye |
| Eye process down (prod) | External monitoring of Eye; modules keep fail-closed |
| Duplicate alerts | Prefer idempotent alert ids / dedupe keys where possible |

---

## Relation to ANTI_POLICE

Notifications inform; they do not police by executive force. See `docs/principles/ANTI_POLICE.md` and [limits.md](./limits.md).  
