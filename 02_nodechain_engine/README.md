# NodeChain Engine

**Path: AROS-PARADIGM-AST/02_nodechain_engine/README.md**

Core documentation for the **NodeChain Engine** — the subsystem of AST (Aros Studio Tokenomics) that records every cause before its effect and executes the distributed work whose PoT confirmation the Coin Engine (`01_coin_engine`) turns into ArosCoin. This layer is described entirely on AST's own terms: NodeChain, nodes, PoT (Proof-of-Transaction), shards, quorum, commission, reserve, and the All-Seeing Eye. It depends on no external system and names none.

⸻

## 0) How to read this layer

Every rule in the NodeChain Engine is a **consequence**, not a preference. The layer stands on the eight invariants defined in `01_coin_engine/README.md` §1 (restated in §1 below for convenience). Each document names the invariants it rests on and derives its mechanics from them by an explicit *because → therefore* chain, labelled with the invariant id, e.g. `(I8)`. If a rule cannot be traced back to an invariant, it does not belong here. Start from any mechanic — a quorum threshold, a signature check, a payment weight — and you can walk the causal chain back to an axiom.

⸻

## 1) Invariants — the axioms this layer serves

The Coin Engine defines these; the NodeChain Engine is where two of them physically live. They are the first causes. Nothing below is true "by policy"; everything is true *because* one of these is true.

- **I1 — PoT-gated origin.** A unit of ARO exists *only* as the consequence of a PoT verdict `verified === 1` for one specific process. No verdict ⇒ no unit. No schedule, pre-mine, mint-on-deposit, or discretionary issuance.
- **I2 — Born-and-burned.** The process part minted for a process is burned atomically at the close of that same cycle. Net process supply change per completed cycle = 0.
- **I3 — Payment for confirmed work.** Nodes are **paid**, post-factum, for executed PoT-confirmed work; the earned part is retained (P6). There is no payment that precedes confirmation and none that occurs without it.
- **I4 — Reserve is AST's own.** The reserve share of commission accrues to AST's own reserve; it belongs to no external party. `reserveIndex = log10(1 + totalProcessVolume)` is derived from confirmed process volume only, never set as a free authority, monotonically non-decreasing in that volume.
- **I5 — Determinism.** Every token movement is reproducible from canonical inputs recorded in NodeChain. Given the same recorded causes, the same effects follow — on every node, every time.
- **I6 — No speculative surface.** ARO has no market price. The model has no referent for — and therefore contains none of — held speculative supply, staking-for-yield, security-deposit-to-participate, governance-by-holding, a hard supply cap, pre-mine or vesting, buyback, liquidity pool, price-floor, volatility control, or external-value ingestion. These are not disabled features; they are concepts with no object here.
- **I7 — All-Seeing Eye: observe and veto, never initiate.** The Eye observes every step and **can veto** (halt) any step that would violate I1–I6. It never initiates a mint, a burn, or a payment. Its power is strictly negative.
- **I8 — Append-only causality.** Every cause (event) is appended to NodeChain *before* its effect is acknowledged. NodeChain is the causal ledger: an effect is valid only because its cause is already recorded and immutable.

⸻

## 2) What this layer *is* — its job in the canon

The Coin Engine mints, burns, and pays; but it can do none of that lawfully unless two facts hold for every step:

1. **The cause was recorded before the effect was acknowledged (I8).**
2. **The whole thing is reproducible from those recorded causes (I5).**

**The NodeChain Engine is the machine that makes both facts true.** NodeChain is the **append-only causal ledger** onto which every event — a PoT verdict, a mint, a burn, a commission split, a payment, a governance parameter change — is appended, in causal order, *before* the effect it authorizes is acknowledged. *Because* an effect is acknowledged only after its cause is immutably on-chain (I8), and *because* the recorded causes are the complete canonical input set (I5), **therefore** any node replaying the chain reconstructs the identical state. That reproducibility is not a feature added on top; it is the direct consequence of append-only causality.

Everything else in this layer — how a node joins, how a transaction is sharded, how shards are signed and reach quorum, how consensus finalizes, how faults are survived, how nodes are paid — exists to get one confirmed unit of work onto the chain **in the right order, exactly once, verifiably**, so that I1–I4 downstream can execute on inputs that are already immutable.

⸻

## 3) Core services & components

Each component is named by the invariant work it does, not by a generic role.

- **Node Registration & Auth** (`node_registration_and_auth.md`) — establishes a node's cryptographic identity and admits it on confirmed work and reputation, never on capital (I6). A node's standing is a function of work it has confirmably done (I3).
- **Transaction Sharding** (`transaction_sharding_logic.md`) — fragments a transaction so no single node sees the whole, and so shards can be validated in parallel; each shard's fate is appended before recombination (I8).
- **Encryption Protocol** (`encryption_protocol.md`) — the per-shard cryptographic isolation that lets distributed processing happen without any node holding the full payload; deterministic so the same inputs yield the same commitments (I5).
- **Shard Validation / Signature / Quorum** (`shard_validation_protocol.md`, `shard_signature_model.md`, `shard_quorum_protocol.md`) — how a shard becomes confirmed work: signed, hash-agreed, and quorum-accepted, with each signature recorded before the shard is acknowledged (I8), so the confirmation is exactly the PoT verdict the Coin Engine consumes (I1).
- **Network Consensus** (`network_consensus_model.md`) — how the shards' local confirmations become one deterministically-ordered global sequence (I5, I8).
- **Fault Tolerance** (`nodechain_fault_tolerance.md`) — how the chain survives node/shard failure *without ever acknowledging an effect whose cause is not recorded* (I8) and without inventing state (I5).
- **Security Model** (`nodechain_security_model.md`) — the zero-trust surface and how the Eye's veto (I7) is wired into it.
- **Node Payment Allocation** (`node_payment_allocation.md`) — how the node share of commission is split among the nodes that confirmably did the work (I3).

⸻

## 4) Directory layout (skeleton)

```
02_nodechain_engine/
├── README.md                          # This file — the layer's job (I8, I5) + map
├── nodechain_overview.md              # Architecture and how it deviates from PoW/PoS
├── node_registration_and_auth.md      # Identity + confirmed-work admission (no stake — I6)
├── transaction_sharding_logic.md      # How a transaction is fragmented and routed
├── encryption_protocol.md             # Per-shard cryptographic isolation (deterministic — I5)
├── shard_validation_protocol.md       # How a shard becomes confirmed work
├── shard_signature_model.md           # How each shard fragment is signed and bound
├── shard_quorum_protocol.md           # Quorum thresholds and fallback for shard acceptance
├── network_consensus_model.md         # Local shard order → one deterministic global order
├── nodechain_fault_tolerance.md       # Surviving failure without breaking I8/I5
├── nodechain_security_model.md        # Zero-trust surface + Eye veto wiring (I7)
├── node_payment_allocation.md         # Node share split by confirmed contribution (I3)
└── Cargo.toml                         # Rust toolchain manifest (not economic canon)
```

⸻

## 5) Canonical constants used here

Defined in `01_coin_engine/README.md` §3; cited here so the causal chains in this layer resolve to one set of numbers.

| Constant | Value | Use in this layer |
|---|---|---|
| `SYMBOL` | `ARO` | Node payments are denominated in ArosCoin. |
| `BASE_UNIT` | `arx` | `1 ARO = 10^9 arx`; payment weights resolve to integer arx. |
| `COMMISSION_RATE` | `0.005` | Source of the commission that funds node payment and reserve. |
| `NODE_SHARE` | `0.75` | Fraction of commission paid to the nodes that confirmed the work (I3). |
| `RESERVE_SHARE` | `0.25` | Fraction accrued to AST's own reserve (I4). |
| `POT_EPOCH_SECS` | `600` | Reference epoch for batched settlement and consensus windows (operational). |

⸻

## 6) The one causal step this layer guarantees

The Coin Engine's whole cycle (see `01_coin_engine/README.md` §4) begins with a single event: *confirmed work — a PoT verdict `verified === 1` for a process.* This layer is the elaboration of how that event is **produced and recorded**:

```
raw transaction for process P, amount A
   │
   ├─▶ SHARD into fragments f1..fn (no node sees all of P)           [privacy; parallelism]
   │
   ├─▶ ENCRYPT each fragment (per-shard key, deterministic commit)   [I5]  appended [I8]
   │
   ├─▶ SIGN + HASH each shard; collect signatures                    appended before accept [I8]
   │
   ├─▶ QUORUM: ≥ threshold matching signatures per shard             local confirmation
   │
   ├─▶ CONSENSUS: order the confirmed shards into one global sequence [I5]  appended [I8]
   │
   └─▶ EMIT PoT verdict verified===1 for P  ──────────────────────▶  cause consumed by 01_coin_engine (I1)
```

Every arrow appends its cause to NodeChain before the next arrow is acknowledged (I8). Because the sequence is a pure function of the recorded inputs, any node can replay it to the identical verdict (I5). The Eye watches every arrow and vetoes any that would violate I1–I6 (I7); it authors none of them.

⸻

## 7) Governance & halting in this layer

- **Bounded, role-based parameters.** Operational parameters of this layer (quorum size, timeout windows, epoch length) may change only within protocol bounds and only by role-based AI committee decision, recorded in NodeChain before effect (I8) and therefore reproducible (I5). They are never decided by ARO holdings — a held balance confers no vote (I6).
- **Eye veto (I7).** If any step would let an effect be acknowledged before its cause is recorded, or would produce a non-reproducible state, the Eye halts that step before acknowledgement. The halt is a *stop*, never a substitution.
- **No privileged issuer.** Nothing in this layer can originate a mint, burn, or payment; those are the Coin Engine's effects, and each is gated on a cause this layer must first have recorded (I1, I8).

⸻

## 8) What auditing checks here

Auditing is the restatement of the invariants as tests over the NodeChain record:

- **Causal order (I8):** for every acknowledged effect, its cause appears earlier in the append-only chain.
- **Determinism (I5):** replaying the recorded shard/consensus inputs reproduces the identical PoT verdict on any node.
- **Confirmation before payment (I1, I3):** every node payment credit is preceded by the confirmed work it pays for.
- **Reserve integrity (I4):** the reserve share routes only to AST's own reserve.
- **Eye discipline (I7):** the Eye's log contains only observations and vetoes — never a mint, burn, or payment it authored.
