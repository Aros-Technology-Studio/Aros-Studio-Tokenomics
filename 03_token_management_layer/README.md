# Token Management Layer

**Path: AROS-PARADIGM-AST/03_token_management_layer/README.md**

The Token Management Layer governs two things and only two things: (a) the **lifecycle of ArosCoin (ARO) supply** as it is caused by confirmed work, and (b) the **lifecycle of the smart contracts** that carry out that supply logic — their registration, versioning, upgrade, decommissioning, and audit trail. Both are described entirely on AST's own terms — NodeChain, PoT (Proof-of-Transaction), nodes, ArosCoin, commission, reserve, and the All-Seeing Eye — and depend on no external system.

This layer does **not** allocate supply, schedule issuance, or decide supply by vote. Supply is not something this layer *sets*; it is something this layer *records the consequences of*. Every unit that exists here exists because the Coin Engine (`01_coin_engine`) minted it against a PoT verdict, and every rule below derives from an invariant.

⸻

## 0) How to read this layer

Every rule is a **consequence**, not a preference. The layer stands on the eight invariants restated in §1 (canonically defined in `01_coin_engine/README.md`). Each document states which invariants it stands on and derives its mechanics by an explicit *because → therefore* chain, labelled with the invariant id, e.g. `(I2)`. If a rule cannot be walked back to an invariant, it does not belong here.

⸻

## 1) Invariants this layer stands on

- **I1 — PoT-gated origin.** A unit of ARO exists *only* as the consequence of a PoT verdict `verified === 1` for one specific process. No verdict ⇒ no unit. No schedule, pre-mine, genesis allocation, mint-on-deposit, or discretionary issuance.
- **I2 — Born-and-burned.** The *process part* minted for a process is burned atomically at the close of that same cycle. Net process supply change per completed cycle = 0.
- **I3 — Payment for confirmed work.** Nodes are **paid**, post-factum, for executed PoT-confirmed work; the *earned part* is retained (P6). Payment never precedes or occurs without confirmation.
- **I4 — Reserve is AST's own.** The reserve share of commission accrues to AST's own reserve (`SYSTEM_RESERVE`), belonging to no external party. `reserveIndex = log10(1 + totalProcessVolume)` is derived from confirmed process volume only (I‑RS‑1), never set as a free authority (I‑RS‑2), monotone non-decreasing in volume (I‑RS‑4).
- **I5 — Determinism.** Every token movement and every contract-lifecycle transition is reproducible from canonical inputs recorded in NodeChain.
- **I6 — No speculative surface.** ARO has no market price. The model has no referent for — and therefore contains none of — held speculative supply, staking-for-yield, security-deposit-to-participate, governance-by-holding/voting, hard supply cap, pre-mine/vesting/genesis allocation, buyback, liquidity pool, price-floor/stability, volatility control, external-crypto ingestion, fiat/bridge/tokenization, mint-on-deposit.
- **I7 — All-Seeing Eye: observe and veto, never initiate.** The Eye observes every step — every mint, burn, payment, and every contract registration, upgrade, or destruction — and **can veto** (halt) any step that would violate I1–I6. It never initiates one. Its power is strictly negative.
- **I8 — Append-only causality.** Every cause is appended to NodeChain *before* its effect is acknowledged.

⸻

## 2) Directory layout (skeleton)

```
03_token_management_layer/
├── README.md                          # This file — scope + invariants + map
├── token_issuance_protocol.md         # How a confirmed verdict causes a mint (I1)
├── aroscoin_supply_model.md           # Why supply is derived, not scheduled or capped
├── token_distribution_model.md        # How the earned part splits: node payment + reserve
├── burn_mechanism.md                  # Why and how the process part is destroyed (I2)
├── token_supply_governance.md         # Why supply cannot be governed by vote or holding
├── token_lock_unlock_rules.md         # Why lockups/vesting have no object in this model
├── token_audit_trail.md               # Auditing = the invariants restated over NodeChain
├── smart_contract_registry.md         # The single source of truth for deployed contracts
├── contract_versioning_policy.md      # Semantic versioning + registry enforcement
├── contract_upgrade_proxy.md          # Proxy pattern for replacing logic deterministically
├── smart_contract_upgrade_policy.md   # The upgrade procedure and its guards
└── contract_self_destruct_policy.md   # Deterministic, Eye-vetoed decommissioning
```

The layer splits naturally into two families. **Supply-lifecycle** files (`token_issuance_protocol`, `aroscoin_supply_model`, `token_distribution_model`, `burn_mechanism`, `token_supply_governance`, `token_lock_unlock_rules`) state what supply *is* and *is not*. **Contract-lifecycle** files (`smart_contract_registry`, `contract_versioning_policy`, `contract_upgrade_proxy`, `smart_contract_upgrade_policy`, `contract_self_destruct_policy`) state how the code that enforces supply logic is itself governed. `token_audit_trail` binds both families to the NodeChain record.

⸻

## 3) Canonical constants

Fixed in `01_coin_engine/README.md`; cited here so the causal chains resolve to one set of numbers.

| Constant | Value | Meaning |
|---|---|---|
| `SYMBOL` | `ARO` | Ticker of ArosCoin. |
| `DECIMALS` | `9` | Amount precision. |
| `BASE_UNIT` | `arx` | Smallest unit; `1 ARO = 10^9 arx`, fixed. |
| `COMMISSION_RATE` | `0.005` (0.5%) | Earned-part share of the process amount; adjustable only within bounds `[0, 0.01]`. |
| `NODE_SHARE` | `0.75` | Fraction of commission paid to nodes for confirmed work (I3). |
| `RESERVE_SHARE` | `0.25` | Fraction of commission accrued to `SYSTEM_RESERVE` (I4). |
| `POT_EPOCH_SECS` | `600` | Reference epoch length (operational, not economic). |

There is no `initialSupply`, no `maxSupply`, and no `mintOn` other than a confirmed PoT verdict — because I1 admits no other cause of a unit, and I6 leaves no object for a cap or a genesis allocation.

⸻

## 4) The one cycle this layer manages

```
confirmed work (PoT verdict verified===1, process P, amount A)   [cause — I1]
      │
      ├─▶ MINT process part = A, bound to P            [I1]  recorded in NodeChain [I8]
      ├─▶ CHARGE commission C = A × COMMISSION_RATE     [I3]
      │       ├─▶ node payment   = C × NODE_SHARE    → retained by nodes  [I3]
      │       └─▶ reserve accrual = C × RESERVE_SHARE → SYSTEM_RESERVE      [I4]
      └─▶ on cycle completion: BURN process part = A   [I2]  recorded in NodeChain [I8]

net process supply Δ = 0        (mint A then burn A — I2)
lasting  supply Δ    = + C       (only the earned/retained part survives — I3)
```

Token management is the elaboration of this chain (supply family) and the governance of the code that executes it (contract family). Every contract-lifecycle operation is itself a cause appended to NodeChain before effect (I8), observed by the Eye, vetoable if it would break I1–I6 (I7).

⸻

## 5) Governance in this layer (bounded, role-based, never by holding)

No supply parameter here is set by a token-weighted vote or by any holder franchise — because I6 leaves no object for governance-by-holding. The one adjustable economic parameter, `COMMISSION_RATE`, moves only within bounds `[0, 0.01]`, and only by decision of a role-based AI committee, recorded in NodeChain before effect (I8) and reproducible (I5). Contract-lifecycle decisions (register, version, upgrade, decommission) are likewise role-based committee actions under Eye veto (I7). The Eye sits at the apex of oversight and initiates nothing. There is no external overseer of any kind.

⸻

## 6) What auditing checks (see `token_audit_trail.md`)

Auditing is the restatement of the invariants as tests over NodeChain:

- **Supply conservation (I2):** for every completed process, `processMinted == processBurned`.
- **Payment causality (I1, I3):** every earned credit is preceded by a `verified===1` verdict for the same process.
- **Reserve integrity (I4):** `reserveIndex` is a pure function of confirmed process volume.
- **Idempotency (I5, I8):** replaying a recorded cause produces no second effect.
- **Contract-lifecycle discipline (I5, I7, I8):** every registration, upgrade, and destruction is recorded before effect, reproducible, and carries no step the Eye vetoed.
