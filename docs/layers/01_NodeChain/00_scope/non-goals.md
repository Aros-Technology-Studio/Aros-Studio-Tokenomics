# Non-goals — 01_NodeChain

This layer **does not** own the following. They must not be implemented or specified as core duties of NodeChain.

| Non-goal | Owner |
|----------|--------|
| PoT criteria P1–P4 and binary `verified` decision logic | PoT layer |
| Institutional document / signature **policy evaluation** | PoT / governance / intake policy |
| Mint, burn, supply formulas, ΔValue | Token / emission |
| Commission rates and 70/30 (or any) split math | Commission / settlement |
| All-Seeing Eye AI hierarchy, policy, halt/veto rules | ASE + governance (supra-layer) |
| Market price, staking, farming, liquidity | Forbidden by product model — nowhere |
| End-user portal / UI | Out of product scope |
| Full BFT multi-shard consensus mesh (v1) | Roadmap only (`05_network/consensus-roadmap.md`) |
| Transaction field-sharding privacy mesh (v1) | Not v1; optional later package |
| Custody of third-party funds | Forbidden globally |

## Clarifications

### PoT records vs PoT engine

NodeChain **stores** records such as `pot_evidence_ref` or `pot_verdict` payloads that other components submit.  
NodeChain **does not** evaluate P1–P4.

### ASE presence

ASE may appear in observability docs as a **consumer** of events.  
ASE is not a subdirectory of NodeChain and does not define append authorization here.

### Payment of nodes

How much a node is paid is commission/settlement.  
NodeChain may store `payment_credited` facts. Weights and formulas live outside this layer.

### “Blocks”

Product language uses **journal records**, **height**, **snapshots** — not chain “blocks” in API or docs of this layer.
