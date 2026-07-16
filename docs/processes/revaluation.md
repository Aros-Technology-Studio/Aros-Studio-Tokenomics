# Process: Revaluation (value change)

**Status:** Canonical process description (v1)  
**Canon:** Core Canon §5.3, §6.4, §9.10, I1–I4, **I7**, **I9**; PoT §4.2; NodeChain §4.1  
**Decisions:** emission (valuation + ΔValue; pro-rata in emission); pot; orchestrator 9-step pipeline  
**Entry:** Institution → **Orchestrator only** (full economic process, new `processId`)  
**Code (target):** `src/orchestrator/`, `src/emission/`, `src/aroscoin/`, `src/pot/`, `src/nodechain/`

---

## 1. Purpose

Revaluation records a **confirmed institutional change** in asset value and adjusts token supply so that the token continues to reflect the current confirmed economic value of the asset (I7).

AST does **not** calculate or invent ΔValue. AST accepts only an **already confirmed institutional valuation change** and applies the supply principle of §9.10 with **pro-rata** mint or burn (I9).

---

## 2. Preconditions

| Requirement | Rule |
|-------------|------|
| Asset already tokenized | Primary tokenization completed; NodeChain registry exists |
| Institutional ΔValue package | Confirmed increase or decrease + qualified signatures |
| No self-appraisal | System must not derive ΔValue from market, models, or Eye |
| PoT + NodeChain | Supply must not change without `verified = 1` and write-ahead ledger |
| processId | Full new process: `AST-{INST}-{YYYYMMDD}-` + UUIDv7 |
| Idempotency | Mandatory `idempotencyKey` |

---

## 3. Actors

| Actor | Role |
|-------|------|
| Institution | Provides confirmed new valuation / ΔValue package |
| Orchestrator | Sole entry; fixed pipeline |
| Quorum validators | PoT P1–P4 |
| Emission | Deterministic mint/burn plan + pro-rata map |
| ArosCoin | Executes mint/burn results; does not invent valuation |
| Commission | Post-factum fee on process rules (valuation / schedule) |
| All-Seeing Eye | Observe only |

---

## 4. Full process (orchestrator alignment)

Same 9-step discipline as primary tokenization; emission step is **mint or burn** according to sign of ΔValue.

| # | Step | Notes for revaluation |
|---|------|------------------------|
| 1 | StartProcess | New processId; link to asset / prior process refs |
| 2 | Documents + signature | Institutional revaluation package + КЭП |
| 3 | Oracle (if required) | Fail-closed if policy requires and oracle fails |
| 4 | PoT Evaluation | P1–P4; evidence of confirmed ΔValue fact |
| 5 | NodeChain record | Write-ahead **before** any supply side-effect |
| 6 | Emission / Burn | Plan from valuation + ΔValue; I9 pro-rata |
| 7 | Settlement | Commission post-factum on PoT |
| 8 | State + notify | Snapshots; Eye observes |
| 9 | EndProcess | Terminal status |

Compensation only **before** `verified = 1`. Mint/burn after verified is not Eye-reversible.

---

## 5. PoT for revaluation

Value **change** is gated by PoT the same way as origin of value (Core Canon §4.2).

| Criterion | Revaluation meaning |
|-----------|---------------------|
| **P1** | Institution in allowlist; process type allowed |
| **P2** | Full revaluation stages completed |
| **P3** | Significant states on NodeChain path |
| **P4** | Deterministic completion under revaluation process-type rules |

- Any fail → `verified = 0` + reason codes → **no** mint/burn.  
- Timeout **15m** → expired → new processId.  
- PoT carries no amount math; emission owns the plan.

---

## 6. Formulas (normative)

### 6.1 Supply change principle (Core Canon §9.10)

Let `V_prev` = previous confirmed institutional value,  
`ΔValue` = confirmed absolute change magnitude (institutional),  
`S` = current token supply for the asset.

**Confirmed increase:**

```
new_supply = current_supply × (1 + ΔValue / previous_value)
```

**Confirmed decrease:**

```
new_supply = current_supply × (1 − ΔValue / previous_value)
```

### 6.2 Mint / burn quantity

```
ΔS = new_supply − current_supply
```

- `ΔS > 0` → **mint** `ΔS` (floor to 9 decimals).  
- `ΔS < 0` → **burn** `|ΔS|` (floor rules as configured; fail-closed if insufficient holdings under policy).  
- Zero ΔValue → emit zero **or** burn path per **asset policy** (P0–P4 emission).

### 6.3 Pro-rata distribution (I9)

New emission is always distributed **pro-rata to current holders**:

```
mint_i = floor(ΔS × (balance_i / current_supply), 9 decimals)
```

Burn on decrease is allocated pro-rata to current holders (same ratio principle) so residual supply still tracks confirmed value (I7). Dust / remainder handling: min **1 arx** (`10^-9` ARO); deterministic residual policy in emission (replay-stable).

### 6.4 What emission does **not** do

- No α·TV + β·U + γ live model.  
- No market price discovery for mint basis.  
- No privileged mint to treasury for “rebalance” outside pro-rata (I9).

---

## 7. NodeChain and token protocol

Every revaluation:

1. PoT verdict recorded.  
2. Emission plan hash / supply delta bound to `processId`.  
3. Mint/burn events chained (content hashes + prev hashes).  
4. Client ack only after NodeChain events exist.

Canonical Layer remains NodeChain + PoT; ERC adapters never become source of truth.

---

## 8. Commission

Post-factum settlement on PoT: fee schedules may key off valuation base and/or process type. Default economic split remains **70% nodes / 30% AST** unless configured. Currency ARO. NodeChain-visible. No farming or staking payouts.

---

## 9. Fail-closed summary

| Failure | Outcome |
|---------|---------|
| Invalid / unsigned ΔValue package | Reject before verified |
| PoT fail or timeout | No supply change |
| Ledger append fail | No mint/burn |
| Cap policy breach | Fail plan; no partial silent mint |
| Insufficient balance for pro-rata burn | Hard fail per policy |
| Settlement fail after supply change | Retry settle; no unauthorized reverse burn as “fix” |

---

## 10. Hard prohibitions

- AST inventing or “adjusting” institutional ΔValue.  
- Free or admin mint on revaluation.  
- Non–pro-rata preferential mint (violates I9).  
- Supply change without PoT + NodeChain.  
- Eye veto/rollback of verified revaluation.  
- Using ERC representation as sole ledger of supply.

---

## Related

- Primary path: [primary-tokenization.md](./primary-tokenization.md)  
- Packs: `emission`, `aroscoin`, `pot`, `orchestrator`, `nodechain`  
- Canon formulas: `docs/AST-CORE-CANON.md` §9.10  
- Invariants: I2 (every emission/burn bound to process), I7, I9
