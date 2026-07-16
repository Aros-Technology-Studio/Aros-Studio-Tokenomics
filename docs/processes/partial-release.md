# Process: Partial release

**Status:** Canonical process description (v1)  
**Canon / packs:** `partial-release`, `orchestrator`, `aroscoin`, `reserve`, `release` (I8)  
**Decisions:** P4 partial-release; P2–P3 release vs partial split  
**Code (target):** `src/partial-release/`, `src/orchestrator/`, `src/aroscoin/`, `src/reserve/`, `src/core-api/`  
**API (target):** `POST /v1/core/partial-release`

---

## 1. Purpose

Partial release is a **holder-position** process that releases a **portion** of a claim through a **full economic process** with a **new `processId`**. It is **not** Release Phase activation and does **not** flip system-wide circulation gates.

Atomic effect: **burn + reserve child record + remint** (claim split), with dust rules and NodeChain ExecutionSnapshot.

---

## 2. Distinction from Release Phase

| | Partial release (this doc) | Release Phase |
|--|----------------------------|---------------|
| Scope | Single holder position / claim | System-wide ArosCoin & asset-token regime |
| Trigger | Holder + institutional approval | `release_daemon` metrics + governance |
| Module | `partial-release` | `release` + `release-daemon` |
| Effect | Split claim; internal economics | Opens external circulation gates (I8) |
| processId | Full new orchestrator process | Phase transition event (not partial-release) |

See [release-phase.md](./release-phase.md) for phase activation.

---

## 3. Actors

| Actor | Role |
|-------|------|
| Holder | Requests partial release via Portal |
| Institution | **Approval required** (no anonymous external partial) |
| Orchestrator | Sole process entry; new `processId` |
| ArosCoin | Burn + remint legs of atomic saga |
| Reserve | Child records for split claim; hard fail if insufficient |
| PoT + NodeChain | Verdict + write-ahead + `partialRelease` payload |
| Release gates | Pre–Release Phase: **internal only** (I8) |
| All-Seeing Eye | Observe only |

---

## 4. Preconditions

| Requirement | Rule |
|-------------|------|
| Holder identity | Authenticated AST holder of claim |
| Institutional approval | Explicit; reject without it |
| Amount | ≥ dust (`10^-9` ARO / 1 arx) |
| Claim refs | Valid process/claim identifiers |
| Pre–Release Phase | External partial **rejected**; internal only |
| Idempotency | Mandatory at StartProcess |
| Orchestrator | No side-door partial without orchestrator |

---

## 5. Steps

1. **Request** — Holder submits amount + claim refs via Portal.  
2. **Institutional approval** — Required; process does not proceed without it.  
3. **StartProcess** — Orchestrator allocates **new** `processId` (`AST-{INST}-{YYYYMMDD}-` + UUIDv7).  
4. **Pipeline** — Same economic discipline as other processes: docs/policy checks as required → PoT (P1–P4) → NodeChain write-ahead.  
5. **Atomic saga** (fail-closed as a unit for economic legs after gates):  
   - **Burn** source claim amount (or full claim then remint remainder, per pack model).  
   - **Reserve child record** — partial-release = child records; insufficient reserve → **hard fail**.  
   - **Remint** residual / split claims; **dust = ARO** at 1 arx minimum.  
6. **NodeChain payload** — ExecutionSnapshot + `partialRelease` (incl. pro-rata impact flag).  
7. **Settlement** — Commission per process type if applicable (post-factum, NodeChain-visible).  
8. **EndProcess** — Terminal status.

Compensation for incomplete pre-verified steps follows orchestrator rules (**only before** `verified = 1`). Non-atomic leak of burn without remint/reserve child is forbidden.

---

## 6. Atomic burn + reserve child + remint

Normative intent:

```
assert(approval && amount >= dust)
→ PoT verified = 1
→ NodeChain write-ahead
→ atomic {
     burn(sourceClaim, amount)
     reserve.createChild(parentClaim, amount, processId)
     remint(residualClaim / split claims)
   }
→ record partialRelease on NodeChain
```

| Property | Rule |
|----------|------|
| Atomicity | All three legs succeed or none leave durable partial economic state |
| Reserve | Multi-asset own books only; child records for partial |
| Pro-rata | Holder impact recorded; silent non–pro-rata forbidden |
| Dust | Floor / remainder in ARO at 1 arx |
| Double path | Guards in TS core (+ Solidity mirror where used) |

---

## 7. Pre-phase internal only (I8)

Until Release Phase:

- Partial release may run **only** in **internal** roles (process unit / payment unit circulation).  
- Attempts that would externalize process value to free market, CEX, or public trading paths are **architecturally blocked**.  
- After Release Phase, external effects still require compliance gates; partial-release remains a **separate** module from phase flip.

---

## 8. Governance

- **Lighter** than full Release Phase change, but **not zero** for large partials without config.  
- Institution + holder consent are mandatory minimum.  
- Large partial thresholds may require additional multi-step approvals per config (not Eye executive power).

---

## 9. Fail-closed summary

| Failure | Outcome |
|---------|---------|
| No institutional approval | Reject |
| Amount &lt; dust | Reject |
| External attempt pre–Release Phase | Reject (I8) |
| PoT fail / timeout | No burn/remint |
| Insufficient reserve | Hard fail |
| Non-atomic partial failure | Compensate within process rules (pre-verified only) |
| Side-door without orchestrator | Forbidden |

---

## 10. Hard prohibitions

- Treating partial-release as phase activation.  
- Partial without new `processId` / PoT / NodeChain.  
- Anonymous or institution-unsigned external partial.  
- Eye veto/rollback as completion mechanism.  
- Third-party custody of released value outside Selective Custody rules.

---

## Related

- Packs: `partial-release`, `aroscoin`, `reserve`, `orchestrator`, `release` (gates only)  
- Phase process: [release-phase.md](./release-phase.md)  
- Runtime: `docs/WORKFLOWS.md` §2.5  
- Decisions: `docs/P0-P4-TECHNICAL-DECISIONS.md` § partial-release
