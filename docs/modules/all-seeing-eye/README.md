# All-Seeing Eye module

**Code path:** `src/all-seeing-eye/`  
**Canon:** `docs/AST-CORE-CANON.md` §4.3, §X, §XII  
**Decisions:** P1 all-seeing-eye  
**Pack:** `docs/components/all-seeing-eye/`  
**Principle:** `docs/principles/ANTI_POLICE.md`

---

## Role

The All-Seeing Eye is an independent **monitoring, audit, and alerting** plane.

It:

- **Observes** system events (all events; depth may vary)
- **Records** observations and violations
- **Notifies** ops humans and the Orchestrator (operational awareness only)

It does **not**:

| Forbidden | Canon |
|-----------|--------|
| Veto | §4.3, §X |
| Rollback | §4.3, §X |
| Mint / burn / pay | Pack PURPOSE; decisions P1 |
| Initiate economic processes | Parallel observation only |
| Own fail-closed enforcement | Executing module owns fail-closed |

---

## Deployment

| Requirement | Value |
|-------------|--------|
| Process boundary | **Separate process** deployment (ops concern; logic lives in service) |
| Truth | NodeChain primary; analytic mirror **non-SoT** |
| Mirror lag | **≤ 30 seconds** (Canon §XII) |
| Disable in prod | **Forbidden** |
| Disable in non-prod | Allowed for dev/test |

---

## Consumers

| Consumer | Use of Eye output |
|----------|-------------------|
| Ops humans | Critical alerts + audit batches |
| Orchestrator | May react **operationally** (pause intake via kill switch, ops runbooks) — **not** because Eye has executive power |
| Analytics | Mirror queries |

Orchestrator reaction is **not** “Eye veto.” Kill switch and write guards remain owned by executing modules.

---

## Module docs in this folder

| File | Topic |
|------|--------|
| [observation-scope.md](./observation-scope.md) | What is observed; NodeChain + mirror |
| [notification.md](./notification.md) | Sync critical vs async batch; reason codes |
| [limits.md](./limits.md) | Hard bans; prod enablement; anti-police |

---

## Related

- Invariants consumer: `InvariantBroken` → critical alert  
- Node reputation: observe suspend/restore (no slash executive)  
- Orchestrator: alert consumer only  
