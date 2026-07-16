# Orchestrator — fixed 9-step pipeline

**Module:** `orchestrator`  
**Code:** `src/orchestrator/`  
**Canon:** Core Canon §V (primary tokenization), §VIII (module rules), §XII (timeouts)

---

## Principle

Every economic process runs the **same ordered pipeline**. Steps may be **skipped only when the process type explicitly allows it** (e.g. Oracle Gateway when not required). Reordering, parallelizing critical economic steps, or inventing side doors into mint/settle is a **canon violation**.

Pipeline step identifiers used in code (`PipelineStep`):

```text
StartProcess
DocumentValidation
OracleGateway
PoTEvaluation
NodeChainRecord
EmissionBurn
Settlement
StateUpdate
EndProcess
```

---

## Step catalog

### 1. StartProcess

| Field | Value |
|-------|--------|
| Owner | Orchestrator |
| Input | institutionCode, **idempotencyKey**, institutionalValuation, currency, assetType, holderId |
| Output | `processId`, initial status |
| Success | Process snapshot created; concurrent counter incremented; NodeChain `process_started` (or equivalent write-ahead); state-recording snapshot |
| Fail | Kill-switch on; missing/invalid key; concurrency ≥ 10; invalid payload |

Rules:

- Sole mint of `processId` for this cycle  
- Same `(institutionCode, idempotencyKey)` returns the **existing** process (idempotent start)  
- Status typically moves to `documents_pending` / step `DocumentValidation`  
- Institutional valuation is **accepted as provided** — AST does not recompute price  

---

### 2. Document + Signature Validation

| Field | Value |
|-------|--------|
| Owner | Portal / edge validation + orchestrator gate; cert path aligns with `nodes` |
| Input | Document package + **qualified electronic signature (КЭП)** |
| Output | Validated package bound to `processId` |
| Success | Signatures authentic; documents complete for process type |
| Fail | Invalid/missing signature; incomplete package → process cannot satisfy PoT P1–P4 |

Rules:

- Primary tokenization requires institutional package + qualified signature (Canon §5.2)  
- Without valid docs/КЭП, PoT cannot reach `verified = 1`  
- Portal may pre-check signatures; authoritative completion remains on the process path  

---

### 3. Oracle Gateway (if needed)

| Field | Value |
|-------|--------|
| Owner | `oracle-gateway` |
| Input | `processId`, attestation set (multi-oracle + signatures) |
| Output | `ok` + NodeChain accept record, or fail-closed |
| Success | `acceptedCount ≥ requiredCount`; ledger record on accept |
| Fail | Quorum/signature fail → **fail-closed** → process **expired** path |

Rules:

- Transport and verification only — **not** AST self-appraisal  
- When process type requires oracle, **skip is forbidden** in v1  
- When not required, step is omitted without inventing data  
- Detail: `docs/modules/oracle-gateway/`  

---

### 4. PoT Evaluation

| Field | Value |
|-------|--------|
| Owner | `pot` (quorum validators submit; Orchestrator coordinates only) |
| Input | Evidence: processId, ExecutionSnapshot hashes, validatorIds, qualified signatures, criteriaResult P1–P4 |
| Output | Binary `verified` ∈ {0, 1}; final when 1 |
| Success | All P1–P4 true; M-of-N quorum (default 2/3); uniqueness / ordering rules |
| Fail | Any criterion fail → `verified = 0` + reason codes; timeout 15m → expired → new processId |

Criteria (always all four in v1):

| ID | Meaning |
|----|---------|
| P1 | Allowed context (valid institutional cert + allowlist) |
| P2 | Full execution stage sequence completed |
| P3 | Significant states on NodeChain |
| P4 | Completed under process-type rules (deterministic) |

Rules:

- Orchestrator **must not** self-verify or replace quorum  
- No amount math in PoT  
- Double confirm same processId → error + Eye-visible record  
- NodeChain record **before** emission (pipeline step 5 before 6; pot pack: ledger before mint)  

---

### 5. NodeChain Record

| Field | Value |
|-------|--------|
| Owner | `nodechain` (+ `state-recording` snapshots inside SoT) |
| Input | Process payload, PoT outcome, hashes |
| Output | Append-only record; ledger height / chaining |
| Success | Immutable append with content hashes + processId |
| Fail | Append failure → **fail-closed**; no emission |

Rules:

- NodeChain is sole source of truth (Canon §4.1)  
- Write-ahead for significant states before client-visible completion  
- Institution may read **own** processes only  

---

### 6. Emission / Burn

| Field | Value |
|-------|--------|
| Owner | `emission` → `aroscoin` (reserve updates as process requires) |
| Input | Institutional valuation + ΔValue; prior PoT `verified = 1` + NodeChain |
| Output | Mint / burn / claim effects; pro-rata per I9 when applicable |
| Success | Deterministic supply change bound to processId |
| Fail | Without PoT/NodeChain → forbidden; zero ΔValue → emit zero or burn per asset policy |

Rules:

- Privileged mint is forbidden; pre-mine is forbidden  
- Emission only after confirmed process  
- I9: new emission pro-rata to current holders  

---

### 7. Settlement (commission)

| Field | Value |
|-------|--------|
| Owner | `commission` (settlement alias) |
| Input | Base = valuation; fee schedule; node weights |
| Output | Post-factum distribution (default 70% nodes / 30% AST) |
| Success | NodeChain-visible settlement records |
| Fail after mint | **Retry settlement** — do **not** burn-compensate the mint (Canon §XII) |

---

### 8. State Update + Notification

| Field | Value |
|-------|--------|
| Owner | `state-recording`; notifications; Eye observes |
| Input | Terminal economic outcomes |
| Output | Snapshots (schema: processId, sequenceId, timestamp, stateType, payloadHash, prevStateHash, validatorId, status); ops-facing notify |
| Success | Snapshots inside NodeChain SoT; Eye may alert but cannot veto |

---

### 9. EndProcess

| Field | Value |
|-------|--------|
| Owner | Orchestrator |
| Input | All prior steps terminal success |
| Output | Status `completed`; concurrent slot released |
| Success | Client may treat process as finished only after durable write path |
| Fail paths | `failed` (after compensation if pre-verified); `expired` (timeout / oracle fail-closed) |

---

## Status model (implementation)

| Status | Typical meaning |
|--------|-----------------|
| `created` | Start accepted (may be brief) |
| `documents_pending` | Awaiting valid signed docs |
| `validating` | Document/signature validation |
| `pot_pending` | PoT evaluation in flight |
| `settling` | Emission / settlement |
| `completed` | EndProcess success |
| `failed` | Terminal fail (+ compensation if pre-`verified=1`) |
| `expired` | Timeout or oracle fail-closed |

---

## Optional gates (not pipeline reordering)

| Gate | When |
|------|------|
| AI L1 (docs + basic risk) | Real service in v1; L2/L3 optional |
| Human approval | By asset policy only — not mandatory on every process |
| Kill switch / read-only | Blocks **new** economic side-effects |

---

## Fail-closed matrix (summary)

| Failure | Pipeline outcome |
|---------|------------------|
| Missing idempotencyKey | Reject start |
| Concurrent ≥ 10 / institution | Reject (or configured backpressure) |
| Docs / КЭП invalid | Cannot complete; stays pending or fails validation |
| Oracle required & fail | Expire process (fail-closed) |
| PoT criteria or quorum fail | `verified ≠ 1`; no emission |
| NodeChain append fail | No emission |
| Step timeout (5m default) | Fail + compensate if allowed |
| Process timeout (30m) | Fail + compensate if allowed |
| Settlement after mint fails | Retry settle; keep mint |

---

## What the pipeline must never do

- Bypass PoT or NodeChain for significant token operations  
- Allow mint/settle APIs to be called as a public side entry  
- Treat technical logs as business truth  
- Let All-Seeing Eye veto or rollback a step  
- Compensate after `verified = 1` (see [saga-compensation.md](./saga-compensation.md))  
