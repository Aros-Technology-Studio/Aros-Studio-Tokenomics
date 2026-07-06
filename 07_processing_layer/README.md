# Processing Layer

**Path: AROS-PARADIGM-AST/07_processing_layer/README.md**

Core documentation for the AST (Aros Studio Tokenomics) **Processing Layer** — the machinery that carries a candidate process from intake to the point where PoT (Proof-of-Transaction) can render a verdict, and that records every step in NodeChain *before* its effect is acknowledged. This layer is described entirely on AST's own terms: NodeChain, PoT, nodes, ArosCoin (ARO), commission, reserve, and the All-Seeing Eye. It depends on no external system and names none.

⸻

## 0) How to read this layer

Every rule in the Processing Layer is a **consequence**, not a preference. The layer stands on the eight invariants of the Coin Engine (`01_coin_engine/README.md` §1), reproduced in §1 below. Each document here states which invariants it stands on and derives its mechanics from them by an explicit *because → therefore* chain, labelled with the invariant id, e.g. `(I8)`. If a rule cannot be traced back to an invariant, it does not belong here. This is what "canon" means: start from any mechanic and you can walk the causal chain back to an axiom.

The Processing Layer **initiates nothing economic**. It does not mint, burn, or pay. It orders and prepares work so that a PoT verdict `verified === 1` can *cause* emission (I1) in the Coin Engine, and so that every cause is on NodeChain before its effect is acknowledged (I8). That is its entire remit.

⸻

## 1) Invariants — the axioms this layer stands on

These are the first causes. Nothing below is true "by policy"; everything is true *because* one of these is true.

- **I1 — PoT-gated origin.** A unit of ARO comes into existence *only* as the consequence of a PoT verdict `verified === 1` for one specific process. No verdict ⇒ no unit. No schedule, pre-mine, mint-on-deposit, or discretionary issuance.
- **I2 — Born-and-burned.** The process part minted for a process is burned atomically at the close of that same cycle. Net process supply change per completed cycle = 0.
- **I3 — Payment for confirmed work.** Nodes are **paid**, post-factum, for executed PoT-confirmed work; the earned part is retained (P6). No payment precedes the work or occurs without its confirmation.
- **I4 — Reserve is AST's own.** The reserve share of commission accrues to AST's own reserve. `reserveIndex = log10(1 + totalProcessVolume)` is derived from confirmed process volume only, never set as a free authority.
- **I5 — Determinism.** Every token movement is reproducible from canonical inputs recorded in NodeChain. Given the same recorded causes, the same effects follow, on every node, every time.
- **I6 — No speculative surface.** ARO has no market price. The model has no referent for (and contains none of): held speculative supply, staking, security-deposit-to-participate, governance-by-holding, hard supply cap, pre-mine/vesting, buyback, liquidity pool, price-floor/volatility control, external-crypto ingestion, fiat/bridge/tokenization of external value, mint-on-deposit.
- **I7 — All-Seeing Eye: observe and VETO, never initiate.** The Eye observes every step and **can veto** (halt) any step that would violate I1–I6. It never initiates a mint, burn, or payment. Its power is strictly negative.
- **I8 — Append-only causality.** Every cause is appended to NodeChain *before* its effect is acknowledged.

⸻

## 2) The one chain this layer serves

The Coin Engine derives all supply from a single causal chain (`01_coin_engine/README.md` §4). The Processing Layer is the section of that chain *before* the PoT verdict: it turns a submitted request into a fully-recorded, validated, ordered candidate process, so that PoT can confirm it and thereby *cause* emission.

```
internal request (a candidate process P, amount A)
      │
      ├─▶ INTAKE            admit only internal, well-formed P            [I6 no external ingestion; I8 recorded]
      ├─▶ VALIDATE          structure, identity, determinism, guards      [I5, I7]
      ├─▶ SNAPSHOT          freeze a read-only state view for P           [I5]
      ├─▶ DISPATCH+EXECUTE  isolated, deterministic, resource-bounded     [I5]
      ├─▶ JOURNAL           append every step before acknowledgement      [I8]
      │
      └─▶ hand to PoT       a verdict verified===1 CAUSES emission         [I1]  (in the Coin Engine)
```

Everything in this layer is the elaboration of one link in this chain. The Eye watches each link and vetoes any step that would violate I1–I6 (I7); the journal records each link before it is acknowledged (I8).

⸻

## 3) Directory layout (skeleton)

```
07_processing_layer/
├── README.md                     # This file — invariants + map of the layer
├── TX STRUCTURE & METADATA.md    # The canonical shape of a candidate-process record
├── TX Validation & Safety.md     # The safety chapter: how a request is proven safe before it can cause emission
├── tx_queue_handler.md           # Intake, buffering, channels, priority, TTL — the first gate
├── tx_dispatch_engine.md         # Deterministic movement from queue to execution
├── tx_validation_pipeline.md     # Multi-stage validation ending in PoT hand-off
├── tx_execution_contexts.md      # Isolated, deterministic runtime containers
├── tx_execution_guardrails.md    # The Eye's veto surface inside the pipeline
├── tx_batching_and_sharding.md   # Parallelism by namespace, not by market or jurisdiction
├── tx_simulation_mode.md         # Internal read-only dry-run (no state, no PoT, no payment)
├── tx_state_snapshot_hook.md     # Read-only frozen state view for deterministic evaluation
├── tx_journal_writer.md          # Append-only per-transaction record (I8)
├── tx_audit_log_format.md        # Append-only system-level event record (I8)
├── tx_hash_map_index.md          # Bi-directional index of tx ids to their recorded hashes
├── tx_trace_flags.md             # Additive traceability markers for audit
├── tx_failure_modes.md           # The named states a broken chain can take, and their rejection
├── tx_rollback_strategy.md       # Deterministic reversion of an aborted candidate process
└── tx_ttl_expiration.md          # Bounded lifespan of a queued candidate process
```

If a referenced `/specs`, `/src`, or `/tests` directory is absent in a given checkout, keep the structure and add stubs; tests must continue to assert the invariants unchanged.

⸻

## 4) Canonical constants

Cited by every document; fixed in the Coin Engine (`01_coin_engine/README.md` §3) and reproduced here so the causal chains resolve to one set of numbers.

| Constant | Value | Meaning |
|---|---|---|
| `SYMBOL` | `ARO` | Ticker of ArosCoin. |
| `DECIMALS` | `9` | Amount precision; `1 ARO = 10^9 arx`. |
| `BASE_UNIT` | `arx` | Smallest unit, fixed and immutable. |
| `COMMISSION_RATE` | `0.005` (0.5%) | Earned part charged on a confirmed process; adjustable only within `rateBounds` [0, 0.01]. |
| `NODE_SHARE` | `0.75` | Fraction of commission paid to nodes for confirmed work (I3). |
| `RESERVE_SHARE` | `0.25` | Fraction of commission accrued to AST's own reserve (I4). |
| `POT_EPOCH_SECS` | `600` | Reference epoch length for batched settlement (operational, not economic). |

There is no `initialSupply`, no `maxSupply`, and no emission quota — because I1 admits no cause of a unit but a PoT verdict, and I6 leaves no object for a cap. Any pipeline notion of a "supply ceiling" is therefore absent by construction, not disabled by choice.

⸻

## 5) What this layer must never do (each a concept with no object here)

- **Ingest external value.** No bridge, cross-chain entry/exit, swap, crypto-in/out, fiat, custody, or mint-on-deposit exists as an intake source — because I6 gives the model no referent for external value, so no gate can admit it.
- **Impose an emission quota or supply cap.** Emission is gated only by a PoT verdict (I1); a quota would be a second, discretionary gate, which I1 forbids.
- **Price execution.** Execution is bounded by a deterministic resource meter (instruction and memory budgets), not by a priced fee market — because I6 admits no market price to meter against, and I5 requires reproducible cost.
- **Pay before confirmation.** No node is paid for a candidate process until PoT confirms it (I3).
- **Initiate a mint, burn, or payment.** The Processing Layer prepares work; only a confirmed PoT verdict causes emission (I1), and the Eye only vetoes (I7).

⸻

## 6) Security & halting

- **Zero-trust, service-to-service.** AST has no public endpoint and no end-user submission surface; intake sources are internal and pre-registered. There is no external-facing API, wallet, or bridge (I6).
- **Eye veto (I7).** Guardrails (`tx_execution_guardrails.md`) are the Eye's veto surface inside the pipeline: they halt any step that would violate I1–I6 *before* its effect is acknowledged. A halt is a *stop*, never a substitution — the Eye never mints, burns, or pays to "correct" a step.
- **Append-before-acknowledge (I8).** No step is acknowledged to the next stage until its cause is on NodeChain. The journal and audit log are append-only and hash-chained.
- **Circuit breaker.** `KILL_SWITCH=true` places the layer in read-only mode: no new candidate process is admitted, in-flight candidates are aborted and rolled back deterministically, and any process part already minted-but-not-burned upstream is burned to satisfy I2. The breaker is engaged by the Eye veto or the role-based node/oracle committee — never by a single privileged authority, because I1/I5 admit no privileged issuer.

⸻

## 7) What auditing checks

Auditing here is the restatement of the invariants as tests over the NodeChain record:

- **Intake purity (I6):** every admitted candidate names an internal, pre-registered source; no bridge/external/crypto-in source can appear.
- **Causal ordering (I8):** for every acknowledged step, its cause is already recorded with an earlier position in the chain.
- **Emission causality (I1):** no candidate reaches emission without a `verified === 1` PoT verdict; no quota or schedule ever emits.
- **Determinism (I5):** replaying a recorded candidate against its snapshot yields the identical execution and the identical journal entry.
- **Eye discipline (I7):** the guardrail/audit record contains only observations and vetoes — never a mint, burn, or payment authored inside this layer.
