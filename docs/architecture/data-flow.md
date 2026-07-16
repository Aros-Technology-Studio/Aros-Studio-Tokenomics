# Data Flow

**Status:** Architecture — aligned to Core Canon v1.0 + P0–P4  
**Canon:** [`docs/AST-CORE-CANON.md`](../AST-CORE-CANON.md)  
**Parent:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)  
**Process detail:** [`docs/processes/primary-tokenization.md`](../processes/primary-tokenization.md)

---

## 1. Purpose

Canonical **data and control flows**: primary tokenization, PoT → NodeChain → Emission → Settlement, Release metrics, and the All-Seeing Eye observation plane. All paths are **fail-closed**. Eye never commands mint, burn, pay, veto, or rollback.

---

## 2. Primary tokenization (institution path)

Entry is always **Portal edge → Orchestrator only**. Portal does not implement PoT, emission, or ledger.

```
Institution package (valuation + КЭП)
        │
        ▼
Portal (Next.js edge) ──HTTPS /v1──▶ Core Orchestrator
        │                              processId AST-{INST}-{YYYYMMDD}-*
        │                              + idempotencyKey
        ▼
Fixed pipeline (9 steps):
  1 StartProcess
  2 Docs + КЭП verify
  3 Oracle? (if required: multi-oracle + signatures)
  4 PoT (P1–P4, M-of-N)
  5 NodeChain write-ahead
  6 Emission → aroscoin.mint / burn
  7 Settlement (commission post-factum)
  8 State-recording (snapshots in NodeChain)
  9 EndProcess
```

| Rule | Effect |
|------|--------|
| AST does not appraise | Amounts follow institutional valuation + ΔValue, not AST price discovery |
| No free / privileged mint | Mint only emission-after-PoT (Canon §III.5) |
| Compensation | Saga **only before** `verified = 1` |
| Mint OK, settle fail | Retry settlement; **do not** burn-compensate mint (§XII) |

---

## 3. Spine: PoT → NodeChain → Emission → Settlement

Order is **not optional**.

### 3.1 PoT

Evidence: `processId`, ExecutionSnapshot (hash+prevHash), validatorIds, qualified signatures, criteriaResult **P1–P4**.  
Quorum M-of-N (default 2/3) → `verified ∈ {0,1}`.  
`verified = 0` + reason codes → no value change.  
Timeout 15m → expired → new `processId`.  
PoT does **not** compute mint amounts. Double confirm same `processId` → error + Eye-visible record.

### 3.2 NodeChain (write-ahead SoT)

PoT verdict and process events append with content hashes, `processId`, ledger height.  
Append fail → **no emission**. Success → sole validity for subsequent effects.  
Any significant action without a NodeChain record is **invalid** (Canon §III.3, §4.1).  
Postgres may index-mirror; **RocksDB (preferred primary) remains SoT**.

### 3.3 Emission

After NodeChain PoT record: valuation + ΔValue; caps; 9 dp floor; **I9** pro-rata → `aroscoin.mint` / burn → reserve claim consistency.  
Zero ΔValue → emit zero or burn per asset policy. Params only via canon/governance. No free mint.

### 3.4 Settlement (commission)

`settleCommission` → `distributeNodePayment`; default **70% nodes / 30% AST**; post-factum; ARO; NodeChain visibility mandatory. Payment only after execution (Canon §III.2).

---

## 4. Release metrics flow

```
reserve.reserveIndex()     = log10(1 + totalProcessVolume)
velocity-tracker.velocity() = processVolume_24h / circulatingSupply
                │
                ▼
        release-daemon.tick()
                │  both: reserveIndex > threshold AND velocity > target
                ▼
        release.activateFromDaemon + governance
                │
                ▼
        NodeChain phase event
                │
   pre-phase (I8): block free external transfer / CEX / public trading
   post-phase: external transfer / bridge / listing (+ compliance)
```

Config keys: `release.threshold`, `release.target`.  
**partial-release** is a separate full process (new `processId`), not phase activation.

---

## 5. Eye observation plane

Parallel, **async** observation — not on the economic command path.

```
  PoT / NodeChain / Emission / Settlement / Orchestrator
                │  events (batch async; critical alerts may sync)
                ▼
        All-Seeing Eye (separate process)
                ├── analytic mirror (lag ≤ 30s)
                ├── reason-coded alerts → ops / orchestrator
                └── record violations
                ✗  NO veto, rollback, mint, burn, pay, initiate
```

Fail-closed is owned by the **executing module**. Eye disable is non-prod only. Architecture guard: Eye cannot veto/rollback economic state.

---

## 6. Cross-cutting rules

- **UTC only**; institution query = own processes only.  
- Required oracle fail → process expired (fail-closed).  
- ERC adapters: representation only — never inbound economic SoT alone.  
- Kill-switch / read-only blocks new economic side-effects at orchestrator.

---

## 7. Related documents

| Doc | Topic |
|-----|--------|
| [`system-context.md`](./system-context.md) | Actors and boundaries |
| [`security-model.md`](./security-model.md) | Guards and custody |
| [`docs/WORKFLOWS.md`](../WORKFLOWS.md) | Workflow-level sequences |
| Component packs | `docs/components/*/CONTRACT.md` |

If this document conflicts with Core Canon, **Core Canon wins**.
