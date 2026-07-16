# Partial release (position)

**Module:** `partial-release`  
**Code:** `src/partial-release/`  
**Core API:** `POST /v1/core/partial-release` (`src/core-api/core-partial-release.controller.ts`)  
**Canon / decisions:** P4 partial-release; I8 interaction with phase  
**Process doc:** `docs/processes/partial-release.md`  
**Pack:** `docs/components/partial-release/`

---

## Purpose

**Separate from Release Phase activation.** Releases a **portion** of a holder position through a **full economic process** (new `processId`), with atomic:

```text
burn → reserve child record → remint (claim split)
```

Does **not** flip system-wide Release Phase.

---

## Actors

| Actor | Role |
|-------|------|
| Holder | Request (Portal later UI under assets) |
| Institution | **Approval required** |
| Orchestrator | Sole process entry |
| ArosCoin / Reserve | Atomic claim split |
| Release gates | Pre-phase: **internal only** |
| NodeChain | ExecutionSnapshot + `partialRelease` payload |

---

## Lifecycle

```text
Portal request (holder) + institutional approval
  → Orchestrator StartProcess (NEW processId)
  → full pipeline including PoT + NodeChain
  → atomic saga: burn + reserve child + remint
  → NodeChain ExecutionSnapshot + partialRelease (incl. pro-rata flag)
  → EndProcess
```

| Constraint | Rule |
|------------|------|
| processId | Always **new** full id (`AST-…`) |
| Side door without Orchestrator | **Forbidden** |
| Anonymous external partial | **Forbidden** |
| Amount | ≥ dust (`10^-9` ARO / 1 arx) |
| Pre–Release Phase | Internal circulation only |
| Post–Release Phase | External still subject to compliance + phase gates |
| Governance | Lighter than full phase change; configurable multi-step may still apply |
| Pro-rata impact | Recorded; no silent non-pro-rata |

---

## Atomic economic effect

```text
hold claim C amount A
  request partial amount P (dust ≤ P < A or per policy)
  → burn / split
  → reserve child records (immutable history; insufficient → hard fail)
  → remint resulting claims
```

| Property | Rule |
|----------|------|
| Atomicity | burn + reserve child + remint succeed together or fail together under process rules |
| Dust | Same as ARO min unit `10^-9` |
| Double-mint protection | Same as aroscoin / emission rules (processId + claimId discipline) |
| Compensation | Only pre-`verified=1` saga rules; after verified, no saga undo of confirmed value |

---

## Inputs / outputs (contract)

### Inputs

| Input | Source | Required |
|-------|--------|----------|
| Holder request | portal | yes |
| Institutional approval | institution | yes |
| Amount (≥ dust) | request | yes |
| Claim / process refs | aroscoin | yes |
| idempotencyKey | caller | yes (Orchestrator start) |

### Outputs

| Output | Destination |
|--------|-------------|
| New processId | orchestrator |
| Burn / remint effects | aroscoin |
| Child reserve records | reserve |
| ExecutionSnapshot + partialRelease | nodechain |

### Events

- `PartialReleaseRequested`  
- `PartialReleaseProcessStarted`  
- `PartialReleaseCompleted`  
- `PartialReleaseRejected`  

---

## Error paths

| Condition | Behavior |
|-----------|----------|
| No institutional approval | Reject |
| Amount < dust | Reject |
| External attempt pre–Release Phase | Reject |
| Insufficient reserve / claim | Hard fail |
| Non-atomic partial failure | Compensate within process rules (pre-verified only) |
| Concurrent process limit | Orchestrator rejects start if ≥ 10 |

---

## Relation to Release Phase

| Dimension | Phase (`release` + daemon) | Partial-release |
|-----------|----------------------------|-----------------|
| Scope | Network / system | Single position |
| Trigger | Metrics + daemon + governance | Holder + institution |
| Effect | Circulation regime | Claim split |
| Module merge | **Must not** merge into one mega-module | Separate folder `partial-release` |

---

## Portal UX note

Later: Assets → claim → request partial release. Until UI exists, core API and process rules still apply. Portal must not invent a “phase on” control for partial release.  
