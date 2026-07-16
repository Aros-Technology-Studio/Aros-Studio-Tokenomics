# PURPOSE — `all-seeing-eye`

**Status:** ready  
**Canon refs:** `CANON.md` §4.3, §X  
**Code path:** `src/all-seeing-eye/` (separate process deployment)  
**Clarifications:** P1.9 canonical v1

---

## Why this exists

Independent **monitoring, audit, and alerting** plane. Sees the system; records violations; notifies. **Never** vetoes, rolls back, mints, burns, or pays.

---

## Responsibility

- Owns: observation of all events (variable depth), async batch audit + critical sync alerts, standardized reason codes, alert fan-out to ops humans and orchestrator, analytic mirror of NodeChain-sourced logs, dev/test disable switch (never prod).
- Contributes to: visibility and incident awareness.
- Does **not** own: fail-closed enforcement (executing modules), economic initiation, AI decision orchestration (parallel observation only).

---

## Boundary (must not)

- Must not veto or rollback.  
- Must not mint, burn, pay, or substitute economic actions.  
- Must not be the fail-closed authority (executing module owns that).  
- Must not be disableable in production.  
- Must not become a policing/enforcement executive.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Observe **all** events (depth may vary) | Only critical without any global coverage |
| Async batch audit + critical **sync** alerts | Sync-only or silent-only |
| Consumers: ops human + orchestrator | Eye-only dead-end alerts |
| Standardized reason codes | Free-text-only alerts |
| Fail-closed remains in **executing module** | Eye stops the write |
| **Separate process** deployment | Tightly coupled in-process veto hooks |
| Log truth on **NodeChain** + analytic mirror | Analytic store as sole truth |
| Disable in dev/test; never prod | Prod kill-switch for Eye |
| Ban list for monitoring (no exec powers) | Ban list as punishment engine |
| Parallel observation vs AI hierarchy | Eye as command hierarchy root |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| all modules | event sources |
| `invariants` | InvariantBroken consumer |
| `nodechain` | primary log + full history for Eye |
| `orchestrator` | alert consumer (coordination, not Eye power) |
