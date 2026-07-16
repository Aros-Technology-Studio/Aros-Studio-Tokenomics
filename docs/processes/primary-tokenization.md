# Process: Primary tokenization

**Status:** Canonical process description (v1)  
**Canon:** Core Canon §§V–VI, §4.1–4.2, §9.x, I1–I7; orchestrator fixed 9-step pipeline  
**Decisions:** `docs/P0-P4-TECHNICAL-DECISIONS.md` (orchestrator, pot, emission, commission, nodechain)  
**Entry:** Institutional Portal → **Orchestrator only** (no economic side door)  
**Code (target):** `src/orchestrator/`, `src/pot/`, `src/nodechain/`, `src/emission/`, `src/aroscoin/`, `src/commission/`, `portal/`

---

## 1. Purpose

Primary tokenization moves an **already confirmed institutional asset** into the AST digital rights registry. AST does **not** create value and does **not** appraise the asset. It records a fixed institutional price and rights in the form of protocol tokens that thereafter live with the asset on NodeChain.

**Outcome:** tokenized asset at official institutional price; NodeChain becomes the permanent registry of rights for that asset; traditional registry receives a mark that the asset is tokenized (lifecycle duty of the institution / process type rules).

---

## 2. Preconditions

| Requirement | Rule |
|-------------|------|
| Institutional certificate | Valid + allowlist (PoT **P1**) |
| Document package | Official valuation + qualified digital signature (КЭП / X.509 class as configured) |
| No free mint | Emission only after PoT `verified = 1` and NodeChain write-ahead |
| No AST self-appraisal | Valuation is institutional input only |
| Idempotency | Mandatory `idempotencyKey` at StartProcess |
| Concurrency | Max **10** concurrent processes per institution (default) |
| Kill switch | Read-only / kill-switch blocks new economic side-effects |

---

## 3. Actors

| Actor | Role |
|-------|------|
| Institution | Submits package, valuation, signatures |
| Orchestrator | Sole economic entry; coordinates 9 steps |
| Quorum validators | PoT P1–P4; M-of-N (default 2/3); 1 vote per institutional cert |
| NodeChain | Sole source of truth; append-only ledger |
| Emission + ArosCoin | Mint plan and execution after PoT + ledger |
| Commission (settlement) | Post-factum fee distribution |
| All-Seeing Eye | Observe / alert only — **no** veto, rollback, mint, burn, or pay |

---

## 4. Orchestrator pipeline (9 steps)

`processId` format: `AST-{INST}-{YYYYMMDD}-` + UUIDv7. Clock: **UTC only**.

| # | Step | Owner | Success criterion |
|---|------|-------|-------------------|
| 1 | **StartProcess** | orchestrator | `processId` + `idempotencyKey`; concurrent caps enforced |
| 2 | **Documents + signature** | portal edge / orchestrator | Package authentic; qualified e-signature valid |
| 3 | **Oracle Gateway** (if required by asset policy) | oracle-gateway | Multi-oracle + signatures; fail-closed if required and fail |
| 4 | **PoT Evaluation** | pot | P1–P4 all true; M-of-N; `verified = 1` (final) |
| 5 | **NodeChain record** | nodechain / state-recording | Write-ahead ExecutionSnapshot + PoT record; ledger height assigned |
| 6 | **Emission** | emission → aroscoin | Mint **strictly at fixed institutional price**; no privileged mint |
| 7 | **Settlement** | commission | Post-factum on PoT; fee on valuation; default split 70% nodes / 30% AST |
| 8 | **State + notify** | state-recording / eye | Immutable snapshots; Eye observes |
| 9 | **EndProcess** | orchestrator | Terminal success status |

Compensation saga is allowed **only before** `verified = 1`. After verified, outcomes are **not compensatable**. If mint succeeds and settlement fails: **retry settle** — do **not** burn-compensate the mint (§XII).

---

## 5. PoT (Proof of Transaction)

PoT is the **only gate** for origin of value. Without `verified = 1`, no mint is valid.

| Criterion | Meaning for primary tokenization |
|-----------|----------------------------------|
| **P1** | Allowed architectural context (valid institutional cert + allowlist) |
| **P2** | Full stage sequence completed (docs → optional oracle → ready for verdict) |
| **P3** | Significant states recorded / recordable on NodeChain path |
| **P4** | Process type rules satisfied (deterministic primary-tokenization result) |

Evidence includes: `processId`, ExecutionSnapshot (hash + prevHash), `validatorIds`, qualified signatures, `criteriaResult` for P1–P4.  
Any criterion fail → `verified = 0` + reason codes → **no emission**.  
Timeout default **15 minutes** → `expired` → new `processId` required.  
Double confirm same `processId` → error + Eye-visible record.  
PoT does **not** compute amounts.

---

## 6. NodeChain write-ahead

NodeChain is the **sole source of truth**. Order is mandatory:

1. PoT positive verdict assembled.  
2. **Append** PoT + process state to NodeChain (write-ahead).  
3. Only then may emission execute.  
4. NodeChain event for mint **before** client acknowledgment.

Any significant action without a NodeChain record is **invalid**. Append failure → fail-closed → **no emission**.

---

## 7. Emission at institutional price

- Input: confirmed institutional valuation (and ΔValue = 0 or primary-mint plan per process type — primary path mints supply that reflects the official price, not a system appraisal).  
- Model: **institutional valuation + ΔValue** (no α·TV+β·U+γ).  
- Rounding: floor to **9** decimals (arx).  
- Caps: per asset class.  
- Primary minting occurs **strictly at the fixed institutional price** (Core Canon §5.2).  
- Privileged / admin / free / pre-mine mint: **forever forbidden**.  
- AST does **not** appraise assets.

---

## 8. Commission

- Triggered on PoT (post-factum payment for executed work).  
- Base = institutional valuation; currency **ARO**.  
- Default split: **70%** participating nodes / **30%** AST (own books only — Selective Custody).  
- Multi-schedule / asset-class fee rates configurable (sandbox example feeRate **0.15%**).  
- APIs: `settleCommission`, `distributeNodePayment` (no yield/farming vocabulary).  
- Settlement must be NodeChain-visible.

---

## 9. Fail-closed summary

| Failure | Outcome |
|---------|---------|
| Docs / КЭП invalid | Reject / fail path before PoT success |
| Oracle required and fails | Process expired (fail-closed) |
| PoT criterion or quorum fail | `verified ≠ 1`; no emission |
| PoT timeout 15m | Expired; new processId |
| Ledger append fail | No emission |
| Settlement fail after mint | Retry settle; no burn-compensate |
| Kill-switch active | No new economic side-effects |

---

## 10. Hard prohibitions (this process)

- System self-appraisal of assets.  
- Pre-mine and free emission are forbidden.- Emission before NodeChain PoT record.  
- Eye veto or rollback.  
- Third-party custody of participant funds is forbidden.- Bypassing Orchestrator, PoT, or NodeChain.

---

## Related

- Packs: `orchestrator`, `pot`, `emission`, `aroscoin`, `commission`, `nodechain`, `state-recording`, `oracle-gateway`  
- Sibling processes: [revaluation](./revaluation.md), [ownership-transfer](./ownership-transfer.md), [partial-release](./partial-release.md)  
- Runtime overview: `docs/WORKFLOWS.md` §2.1–2.4  
- CLI smoke (if present): `npm run cli tokenize`
