# Aros Studio Tokenomics (AST)

AST is a self-sufficient tokenization infrastructure: NodeChain, Proof-of-Transaction (PoT), nodes, ArosCoin, commission, reserve, and the All-Seeing Eye. It is described entirely on its own terms and depends on no external system.

This repository holds the **canonical** specification of AST, rewritten from scratch so that every rule is *derived* from one of eight invariants by an explicit cause → effect chain. Start from any mechanic and you can walk the causal chain back to an axiom.

## The invariants (see `01_coin_engine/README.md` for the full spine)

- **I1 — PoT-gated origin.** A unit of ARO exists only as the consequence of a PoT verdict `verified === 1` for one specific process.
- **I2 — Born-and-burned.** The process part is minted and atomically burned within the same cycle; net process supply change = 0.
- **I3 — Payment for confirmed work.** Nodes are paid, post-factum, for confirmed work; the earned part is retained. No reward, no incentive.
- **I4 — Reserve is AST's own.** The reserve accrues from confirmed work; its index is derived from confirmed volume only.
- **I5 — Determinism.** Every movement is reproducible from canonical inputs recorded in NodeChain.
- **I6 — No speculative surface.** No cap, no held speculation, no staking-for-yield, no governance-by-holding, no volatility control.
- **I7 — All-Seeing Eye.** Observes every step and can veto; never initiates a mint, burn, or payment.
- **I8 — Append-only causality.** Every cause is recorded before its effect is acknowledged.

## Layers

| Layer | Purpose |
|---|---|
| `01_coin_engine` | ArosCoin origin, movement, and destruction; the invariant spine. |
| `02_nodechain_engine` | NodeChain — the append-only causal ledger. |
| `03_token_management_layer` | Token lifecycle; supply as a derived identity. |
| `06_governance_layer` | AST governance — a role-based hierarchy of AI oversight (no voting). |
| `07_processing_layer` | The transaction processing pipeline. |
| `08_fee_distribution` | Commission (Variant A) and the 75/25 node/reserve split. |
| `10_proof_of_transaction_engine` | PoT — the sole cause of emission and payment. |
| `13_extra_supervisory_layer` | The All-Seeing Eye (observe + veto). |
| `14_decentralized_tx_encoding` | Deterministic transaction encoding. |
| `15_reserve` | AST's own reserve and its capitalization index. |

## Project status

- **`PROJECT_STATUS.md`** — what has been transferred into this repository, what is still pending, and the sequence of next steps.
- **`MIGRATION_REVIEW.md`** — the full per-file review of the source repository (KEEP / CUT / REVIEW).

Constants: `SYMBOL=ARO`, `DECIMALS=9` (`1 ARO = 10^9 arx`), `COMMISSION_RATE=0.005`, `NODE_SHARE=0.75`, `RESERVE_SHARE=0.25`.
