# Block F — Hardening / ops / prod (Bar B)

**Bar B** = regulated / production residual (hosting, audit, keys, multi-region, drills).  
**Law:** Fail-closed · journal SoT · no free mint · Eye observe-only.

| ID | Item | Engineering status | Owner residual |
|----|------|--------------------|----------------|
| **F1** | External security audit | Prep package | Hire auditor · scope letter |
| **F2** | Cloud KMS / real PKCS#11 | Soft-HSM + interface | Real HSM/KMS integration |
| **F3** | Multi-region replication mesh | Catch-up only (#69) | Mesh topology · conflict policy |
| **F4** | Live multi-vendor LLM keys | Env adapters | Secrets store · vendor keys |
| **F5** | Kill-switch / backup / restore drill | Runbook + script | Owner runs drill quarterly |
| **F6** | Monitoring / alerts | `/metrics` · rules · smoke | Prometheus/Alertmanager wire |

Also see: [`docs/HARDENING.md`](../HARDENING.md) · [`docs/AUDIT-PREP-F2.md`](../AUDIT-PREP-F2.md) (prep content reused as F1).

## Commands

```bash
npm run drill:backup-restore    # F5 offline drill (temp dirs)
npm run monitor:smoke           # F6 health + metrics + kill-switch gauge
npm run check:canon
```
