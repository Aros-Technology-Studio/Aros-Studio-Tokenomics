# MODEL — `all-seeing-eye`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| Observation | Seen event / state sample | observationId + content hash ref |
| Alert | Notification with reason code | alertId |
| ReasonCode | Standardized taxonomy | code enum |
| AuditBatch | Async analysis unit | batchId |
| AnalyticMirror | Non-authoritative copy for query | derived from NodeChain |

---

## States and lifecycle

```
event stream → observe (all events, variable depth)
  → critical? → sync alert to ops + orchestrator
  → batch audit → NodeChain-anchored findings + mirror
```

Never: veto, rollback, mint, burn, pay.

---

## Invariants

| Rule | Effect if violated |
|------|--------------------|
| Eye authors mint/burn/pay | architecture violation / reject deploy |
| Eye claims veto/rollback | canon breach |
| Prod Eye disabled | reject config |
| Analytic mirror contradicts NodeChain | NodeChain wins |
