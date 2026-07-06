# Fee / Commission Layer (08_fee_distribution)

**Stands on:** I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment for confirmed work), I4 (reserve is AST's own), I5 (determinism), I7 (Eye observes and vetoes), I8 (append-only causality). See `01_coin_engine/README.md` §1 for the invariant spine.

## Purpose

This layer is the emission-and-commission machinery of AST. It elaborates one causal chain from the Coin Engine: a confirmed process causes the mint of a *process part*, causes a *commission* charged in ArosCoin, and — at the close of the same cycle — causes the process part to be burned. The commission is the only lasting effect, and it divides into exactly two internal shares: **75% node payment** (I3) and **25% AST-own reserve** (I4).

Nothing in this layer *decides* to emit. Emission is not a policy the layer executes; it is a consequence the layer records. The layer's whole job is to prove, for every unit that comes into existence, that a PoT verdict `verified === 1` for one specific process already caused it (I1), and that every downstream movement is reproducible from NodeChain (I5, I8).

## Commission Variant A (the settled position of this layer)

Commission is **paid in ArosCoin** (ARO), not in any external unit, and the earned part is **retained** by its earner (I3). There is no fiat leg, no external settlement, no conversion. The commission a process produces is ArosCoin the moment it exists, and it stays ArosCoin.

## The one cause, and its only two exceptions (there are none)

Emission has exactly one trigger: a recorded PoT verdict `verified === 1` for a specific process (I1). This layer defines **no** governance path, emergency path, treasury path, or override path that can cause a unit to exist. A committee cannot vote a mint into being; the All-Seeing Eye cannot mint (its power is strictly negative — observe and veto, I7); an operator cannot inject supply. Any of those would be a unit with no cause, which the model cannot represent. Where an earlier draft named "Treasury Re-activation," "Emergency Liquidity," or "Post-Audit Reinstatement" as emission exceptions, those are struck: they name causes that do not exist (I1).

## Directory layout (skeleton)

```
08_fee_distribution/
├── README.md                              # This file — the layer's causal spine
├── emission_layer_overview.md             # What the layer is, derived from I1–I4
├── emission_trigger_conditions.md         # The one trigger (a PoT verdict) and its guards
├── emission_flow_pipeline.md              # The cycle, step by step, cause to burn
├── epoch_allocation_model.md              # Epoch settlement: batching, never capping
├── emission_reporting_and_traceability.md # How every movement is reproducible from NodeChain
├── emission_layer_api_interface.md        # The interface: submit a cause, read the record
├── emission_rollbacks_and_freeze_rules.md # Veto, halt, and born-and-burned reversal
└── emission_fraud_prevention.md           # Guards that keep a fabricated cause from confirming
```

## Canonical constants (cited, never redefined here)

| Constant | Value | Meaning |
|---|---|---|
| `SYMBOL` | `ARO` | Ticker of ArosCoin. |
| `DECIMALS` | `9` | Amount precision. |
| `BASE_UNIT` | `arx` | Smallest unit; `1 ARO = 10^9 arx`. |
| `COMMISSION_RATE` | `0.005` (bounds `[0, 0.01]`) | Share of the process amount charged as the earned part; adjustable only within bounds. |
| `NODE_SHARE` | `0.75` | Fraction of commission paid to nodes for confirmed work (I3). |
| `RESERVE_SHARE` | `0.25` | Fraction of commission accrued to AST's own reserve (I4). |
| `POT_EPOCH_SECS` | `600` | Reference settlement window (operational, not economic). |

There is no `initialSupply`, no `maxSupply`, and no per-epoch emission ceiling — I1 admits no cause but a PoT verdict, and I6 leaves no object for a supply cap. See `epoch_allocation_model.md` for why a cap has no referent in this layer.

## The chain this layer records

```
confirmed work (PoT verdict verified===1, process P, amount A)      [cause — I1]
      │  appended to NodeChain before any effect                    [I8]
      ├─▶ MINT process part = A, bound to P                          [I1]
      ├─▶ CHARGE commission C = A × COMMISSION_RATE (in ARO)         [I3, Variant A]
      │        ├─▶ node payment    = C × 0.75 → SYSTEM_NODE_POOL     [I3]
      │        └─▶ reserve accrual = C × 0.25 → SYSTEM_RESERVE       [I4]
      └─▶ on cycle close: BURN process part = A                      [I2]

net process supply Δ = 0        (mint A, burn A — I2)
lasting  supply Δ    = + C       (only retained earned part survives — I3)
```

Every check this layer performs, and every veto the Eye issues (I7), is a test that this chain executed in this order with these amounts. Any deviation is halted before its effect is acknowledged (I7, I8).

## Oversight

Parameters that can move — only `COMMISSION_RATE`, only within `[0, 0.01]` — are set by a role-based AI committee and recorded in NodeChain before effect (I8), never by ARO holdings (I6). The All-Seeing Eye observes every step and can veto any that would violate I1–I6; it initiates no mint, burn, or payment (I7). A held ARO balance confers no authority here.
