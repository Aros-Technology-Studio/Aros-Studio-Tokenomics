# Orchestrator module

**Code path:** `src/orchestrator/`  
**Core API surface:** `src/core-api/`  
**Canon:** `docs/AST-CORE-CANON.md` §§III–VIII, XII  
**Decisions:** `docs/P0-P4-TECHNICAL-DECISIONS.md` (P2 orchestrator)  
**Pack:** `docs/components/orchestrator/`

---

## Role

The Orchestrator is the **sole economic entry** for every AST process cycle (primary tokenization, revaluation, partial release, and any future process type that mutates value or rights).

It:

1. Mints a canonical `processId`
2. Enforces a **fixed 9-step pipeline**
3. Coordinates step owners (PoT, NodeChain, emission, commission, …)
4. Drives **saga compensation** only while PoT has not finalized `verified = 1`
5. Guarantees **idempotency**, **concurrency limits**, and **timeouts**

It does **not** verify PoT itself, invent valuations, store the ledger of truth, or act as the All-Seeing Eye.

---

## Non-negotiable rules

| Rule | Source |
|------|--------|
| No economic cycle outside Orchestrator | Canon §VIII; pack PURPOSE |
| Fixed pipeline order (no ad-hoc reorder) | MODEL; decisions P2 |
| Compensation only **before** `verified = 1` | Canon §XII; decisions P2 |
| `idempotencyKey` mandatory at start | decisions P2 |
| Max **10** concurrent processes per institution | decisions P2; Canon §XII |
| Step timeout default **5 minutes**; process timeout **30 minutes** | Canon §XII |
| Business truth on NodeChain; technical logs elsewhere | pack PURPOSE |
| Mint succeeded + settlement failed → **retry settlement** (no burn-compensate) | Canon §XII |

---

## processId format

```text
AST-{INST}-{YYYYMMDD}-<UUIDv7>
```

- `{INST}` — institution code used at start  
- `{YYYYMMDD}` — UTC date of start  
- `<UUIDv7>` — time-ordered unique suffix  

Bare UUIDs alone are **not** valid process identifiers in product API.

---

## Pipeline (summary)

| # | Step | Owner (typical) |
|---|------|-----------------|
| 1 | StartProcess | orchestrator |
| 2 | Document + Signature Validation | portal edge + orchestrator / nodes cert path |
| 3 | Oracle Gateway (if required) | `oracle-gateway` |
| 4 | PoT Evaluation | `pot` (quorum validators; orchestrator coordinates) |
| 5 | NodeChain Record | `nodechain` / `state-recording` |
| 6 | Emission / Burn | `emission` → `aroscoin` (+ reserve as needed) |
| 7 | Settlement (commission) | `commission` |
| 8 | State Update + Notification | `state-recording`; Eye observes |
| 9 | EndProcess | orchestrator |

Full detail: [pipeline.md](./pipeline.md).

---

## Module docs in this folder

| File | Topic |
|------|--------|
| [pipeline.md](./pipeline.md) | Fixed 9-step pipeline, step contracts, fail-closed |
| [saga-compensation.md](./saga-compensation.md) | Compensation window and reverse order |
| [idempotency.md](./idempotency.md) | Keys, concurrency, timeouts |
| [api.md](./api.md) | Core process API surface |

---

## Related

- Process: `docs/processes/primary-tokenization.md`  
- Portal edge: `docs/modules/portal/` (calls Orchestrator only for economic actions)  
- Oracle step: `docs/modules/oracle-gateway/`  
- Eye (observer only): `docs/modules/all-seeing-eye/`  
