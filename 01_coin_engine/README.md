**AROS Tokenomics — Coin Engine (ACE)**

**Path: AROS-PARADIGM-AST/01_coin_engine/README.md**

Core documentation for the AROS Coin Engine (ACE) — the subsystem of AST (Aros Studio Tokenomics) that governs the origin, movement, and destruction of ArosCoin (ARO). This layer is described entirely on AST's own terms: NodeChain, PoT (Proof-of-Transaction), nodes, ArosCoin, commission, reserve, and the All-Seeing Eye. It depends on no external system and names none.

⸻

## 0) How to read this layer

Every rule in the Coin Engine is a **consequence**, not a preference. The layer rests on eight invariants (§1). Each later document states which invariants it stands on and derives its mechanics from them by an explicit *because → therefore* chain. If a rule cannot be traced back to an invariant, it does not belong here. This is what "canon" means here: the logic is closed and unbreakable — start from any mechanic and you can walk the causal chain back to an axiom.

⸻

## 1) Invariants — the axioms of the Coin Engine

These are the first causes. Nothing below is true "by policy"; everything is true *because* one of these is true.

- **I1 — PoT-gated origin.** A unit of ARO comes into existence *only* as the consequence of a PoT verdict `verified === 1` for one specific process. No verdict ⇒ no unit. Emission has no other trigger: no schedule, no pre-mine, no mint-on-deposit, no discretionary issuance.
- **I2 — Born-and-burned.** The *process part* minted for a process is burned atomically at the close of that same process cycle. The value moved through a process exists only while the process is in flight; when the process completes, that representation ceases to exist. Net process supply change per completed cycle = 0.
- **I3 — Payment for confirmed work.** Nodes are **paid** for executed, PoT-confirmed work, *after* the work is confirmed (post-factum). The paid amount — the *earned part* — is retained by the earner (P6). Payment never precedes the work and never occurs without its confirmation; it is compensation for work already done, nothing more. Payment is the causal effect of confirmed work; nothing else causes it.
- **I4 — Reserve is AST's own.** The reserve share of commission accrues to AST's own reserve; it belongs to no external party and funds no external obligation. The reserve capitalization index is derived *solely* from confirmed process volume recorded in NodeChain (I‑RS‑1), is monotonically non-decreasing in that volume (I‑RS‑4), and is never set as a free authority (I‑RS‑2).
- **I5 — Determinism.** Every token movement is reproducible from canonical inputs recorded in NodeChain. Given the same recorded causes, the same effects follow — on every node, every time. No movement originates from discretion outside the causal chain.
- **I6 — No speculative surface.** ARO has no market price to defend. Its value is *process-bound* (I4), not market-quoted. Consequently the model has no referent for — and therefore contains none of — held speculative supply, staking-for-yield, governance-by-holding, a hard supply cap, pre-mine or vesting, buyback, price-floor, or volatility control. These are not "disabled features"; they are concepts with no object in this system.
- **I7 — All-Seeing Eye: observe and veto, never initiate.** The Eye observes every step of every cycle and **can veto** (halt) any step that would violate I1–I6. It never *initiates* a mint, a burn, or a payment. Its power is strictly negative: it can stop what is wrong; it cannot create anything.
- **I8 — Append-only causality.** Every cause (event) is appended to NodeChain *before* its effect is acknowledged. NodeChain is the causal ledger: an effect is valid only because its cause is already recorded and immutable.

⸻

## 2) Directory layout (skeleton)

```
01_coin_engine/
├── README.md                                 # This file — invariants + map of the layer
├── AST Node Infrastructure Specification.md  # Who executes the work that causes emission
├── aro_emission_protocol.md                  # The emission cycle, step by step, as a causal chain
├── coin_emission_model.md                    # The formulas and the reserve/capitalization math
├── burn_and_mint_rules.md                    # Allowed state transitions and their guards
├── burn_mechanism.md                         # Why and how the process part is destroyed
├── payment_distribution.md                   # How confirmed work becomes node payment
├── node_participation_payments.md            # Per-node payment weighting from confirmed contribution
├── coin_use_cases.md                         # The (few, real) things ARO is for
├── coin_volatility_controls.md               # Why no volatility control exists, and what replaces it
└── AROS_Coin_TokenSpec.json                  # Machine-readable token spec (canonical constants)
```

If a referenced `/specs`, `/src`, `/tests`, or `/fixtures` directory is absent in a given checkout, keep the structure and add stubs; tests must continue to assert the invariants unchanged.

⸻

## 3) Canonical constants

Cited by every other document, fixed here so the causal chains elsewhere resolve to one set of numbers.

| Constant | Value | Meaning |
|---|---|---|
| `SYMBOL` | `ARO` | Ticker of ArosCoin. |
| `DECIMALS` | `9` | Aligned to the canonical `transaction.schema.json` amount precision. |
| `BASE_UNIT` | `arx` | Smallest unit; `1 ARO = 10^9 arx`, fixed and immutable. |
| `COMMISSION_RATE` | `0.005` (0.5%) | Default share of the process amount charged as the earned part; adjustable only within protocol bounds (§5). |
| `NODE_SHARE` | `0.75` | Fraction of commission paid to nodes for confirmed work (I3). |
| `RESERVE_SHARE` | `0.25` | Fraction of commission accrued to AST's own reserve (I4). |
| `POT_EPOCH_SECS` | `600` | Reference epoch length for batched settlement (operational, not economic). |

There is no `initialSupply`, no `maxSupply`, and no `mintOn` other than a confirmed PoT verdict — because I1 admits no other cause of a unit, and I6 leaves no object for a cap.

⸻

## 4) The one cycle everything derives from

The entire layer is the elaboration of a single causal chain. Read it once; every document expands one link.

```
confirmed work (PoT verdict verified===1, for process P, amount A)     [cause — I1]
      │
      ├─▶ MINT process part = A, bound to P                            [I1]  recorded in NodeChain [I8]
      │
      ├─▶ CHARGE commission C = A × COMMISSION_RATE                    [I3]
      │        ├─▶ node payment    = C × NODE_SHARE    → retained by nodes for confirmed work  [I3]
      │        └─▶ reserve accrual = C × RESERVE_SHARE → AST's own reserve                     [I4]
      │
      └─▶ on cycle completion: BURN process part = A                   [I2]  recorded in NodeChain [I8]

net process supply Δ = 0            (mint A then burn A — I2)
lasting  supply Δ    = + C          (only the earned/retained part survives — I3)
```

Every observation the Eye makes is a check that this chain executed in this order with these amounts; any deviation is vetoed before acknowledgement (I7).

⸻

## 5) Governance of parameters (bounded, role-based)

`COMMISSION_RATE` is the only free parameter, and it is not free in the sense of discretion:

- It may change only **within protocol-defined bounds**, so no change can break a causal chain (a rate above bounds would let commission exceed the process amount, contradicting I3).
- A change is a *role-based* decision of the node/oracle committee, observed by the Eye. It is **not** decided by ARO holdings — because I6 leaves no governance-by-holding, a held balance confers no vote here.
- Every change is recorded in NodeChain before it takes effect (I8), so the rate in force for any process is reproducible (I5).

Nothing else — decimals, symbol, supply mechanism, the split, the invariants — is changeable: `changeDecimals: false`, `changeSymbol: false`.

⸻

## 6) Security & halting

- **Zero-trust transport:** service identity → mutual TLS; no public endpoints (AST is service-to-service; there is no end-user auth surface).
- **Eye veto (I7):** if any step would violate I1–I6, the Eye halts that step before its effect is acknowledged. The halt is a *stop*, never a substitution — the Eye does not "correct" by minting or paying.
- **Circuit breaker:** `KILL_SWITCH=true` places the engine in read-only mode; an in-flight process part that was minted but not yet burned is burned to satisfy I2, and no new cause is accepted. The breaker is engaged by the Eye veto or the node/oracle committee — never by a single privileged authority, because I1/I5 admit no privileged issuer.

⸻

## 7) What auditing checks

Auditing is not a separate policy; it is the restatement of the invariants as tests over the NodeChain record:

- **Supply conservation (I2):** for every completed process, `processMinted == processBurned`.
- **Payment causality (I1, I3):** every `earned` credit is preceded by a `verified===1` verdict for the same process.
- **Reserve integrity (I4):** `reserveIndex` is a pure function of confirmed process volume; no other input moves it.
- **Idempotency (I5, I8):** replaying a recorded cause produces no second effect.
- **Eye discipline (I7):** the Eye's log contains only observations and vetoes — never a mint, burn, or payment authored by the Eye.
