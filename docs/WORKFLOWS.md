# AST Workflows

**Status:** Ratified from owner P0–P4 answers + Core Canon v1.0  
**Language:** English  

This document defines (1) **GitHub Action workflows** that defend the canon, and (2) **runtime process workflows** that the system must implement.

---

## 1. GitHub Action workflows

| Workflow file | Job purpose |
|---------------|-------------|
| `ci.yml` | Lint, build, test (Node 20) |
| `canon-gate.yml` | Firewall (legacy external-system names) + forbidden vocabulary |
| `ast-philosophy-guard.yml` | CANON anchors + hard-forbidden live mechanics |
| `require-canon-update.yml` | Architectural diffs must include `CANON.md` |
| `token-protocol-guard.yml` | AST Token Protocol; ERC = adapters only |
| `no-bypass-pot-nodechain.yml` | No PoT/NodeChain bypass |
| `pot-criteria-guard.yml` | PoT Criteria P1–P4 remain in CANON; all-pass rules |
| `no-eye-executive-guard.yml` | Eye: no veto/rollback/mint/burn/pay |
| `component-docs-guard.yml` | All required component packs present (4 files) |
| `layout-scaffold-guard.yml` | `/portal`, `/nodechain`, `/pot-engine` + guard workflows exist |
| `domain-invariants-guard.yml` | Defaults, no admin mint, verified finality, kill-switch docs |
| `ast-guards.yml` | Runs **all** hard guards via `run-all-guards.sh` |
| `nightly-canon-audit.yml` | Daily full guards + soft concept report |

### Local command

```bash
npm run check:canon
# equivalent:
bash .github/scripts/run-all-guards.sh
```

### Script map

| Script | Enforces |
|--------|----------|
| `canon-gate.sh` | Legacy firewall + vocabulary |
| `ast-philosophy-guard.sh` | Philosophy / §X |
| `token-protocol-guard.sh` | Token protocol |
| `no-bypass-pot-nodechain.sh` | No bypass |
| `pot-criteria-guard.sh` | P1–P4 |
| `no-eye-executive-guard.sh` | Eye observe-only |
| `component-docs-guard.sh` | Packs |
| `layout-scaffold-guard.sh` | Layout + workflows |
| `domain-invariants-guard.sh` | Cross-cutting P4 rules |
| `require-canon-update.sh` | Canon sync on arch PRs |
| `run-all-guards.sh` | Orchestrates the above |

---

## 2. Runtime process workflows

### 2.1 Economic cycle (Orchestrator — sole entry)

```
StartProcess (processId = AST-{INST}-{YYYYMMDD}- + UUIDv7, idempotencyKey)
  → Document + Signature Validation
  → Oracle Gateway (if needed)        [fail → process expired]
  → PoT Evaluation                    [P1–P4 all pass; M-of-N; timeout 15m]
  → NodeChain Record                  [write-ahead; SoT]
  → Emission / Burn (if ΔValue ≠ 0)   [valuation+ΔValue; aroscoin.mint]
  → Settlement (commission)           [on PoT; 70/30 default; ARO]
  → State Update + Notification
  → EndProcess
```

**Rules:**

| Rule | Behavior |
|------|----------|
| Sole entry | No economic side doors |
| Idempotency | Mandatory key at start |
| Concurrency | Default max 10 / institution |
| Timeouts | Process 30m; step default 5m |
| Compensation | Only **before** `verified = 1` |
| After verified | **Not compensatable** |
| Mint ok, settle fail | **Retry settle** (do not burn-compensate) |
| Clock | UTC only |

### 2.2 PoT confirmation

```
Evidence assembled (processId, ExecutionSnapshot, validators, signatures, criteriaResult)
  → Quorum validators submit (M-of-N, default 2/3; 1 vote per institutional cert)
  → Evaluate P1, P2, P3, P4 (all required)
  → any fail → verified = 0 + reason codes
  → all pass + quorum → verified = 1 (final, immutable)
  → NodeChain append **before** emission
  → ok-to-emit signal (no amount in pot)
```

Timeout 15m without completion → `expired` → fail closed → new processId only.

### 2.3 Emission + ArosCoin

```
PoT verified + NodeChain
  → Emission computes plan (valuation + ΔValue; floor 9 dp; caps; I9 pro-rata)
  → Reserve lock (hard fail if insufficient)
  → aroscoin.mint / burn
  → NodeChain event **before** client ack
```

No admin mint. Double-mint guard TS + Solidity mirror.

### 2.4 Commission settlement

```
On PoT verified
  → fee on institutional valuation (multi-schedule / asset class)
  → split default 70% nodes / 30% AST reserve
  → settleCommission + distributeNodePayment
  → NodeChain-visible settlement
```

### 2.5 Partial release

```
Holder (Portal) + institutional approval
  → full Orchestrator process (new processId)
  → PoT + NodeChain …
  → atomic burn + reserve child records + remint/split
  → ExecutionSnapshot + partialRelease payload
```

Pre–Release Phase: **internal only**. Pro-rata holder impact. Governance lighter than phase change.

### 2.6 Release Phase

```
release_daemon monitors reserveIndex & velocity
  → (reserveIndex > release.threshold) ∧ (velocity > release.target)
  → initiate + governance approval
  → NodeChain event (prevStateHash + verifier signatures)
  → gates open: external transfer / bridge / listing (+ compliance)
```

Before phase: block free external transfer, CEX listing, public trading.  
Reverse: governance + NodeChain only.

### 2.7 All-Seeing Eye

```
Observe all events (variable depth)
  → critical → sync alert (ops + orchestrator)
  → batch audit async
  → NodeChain-anchored findings + analytic mirror (lag ≤ 30s)
```

**Never:** veto, rollback, mint, burn, pay. Fail-closed stays in **executing module**.

### 2.8 Kill switch

```
KILL_SWITCH / read-only mode (v1 required)
  → no new economic causes accepted
  → in-flight rules per ops policy + invariants (process integrity)
```

---

## 3. Environment names

`local` | `test` | `sandbox` | `prod`

---

## 4. Relationship to docs

| Artifact | Role |
|----------|------|
| `CANON.md` | Sole source of truth |
| `docs/components/*` | Per-component packs |
| `docs/WORKFLOWS.md` | This file — CI + runtime flows |
| `.github/workflows/*` | Automation of §1 |
