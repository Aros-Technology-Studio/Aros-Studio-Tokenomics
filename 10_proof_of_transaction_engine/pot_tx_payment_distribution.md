# PoT Transaction Payment Distribution

**Stands on:** I3 (payment for confirmed work), I1 (PoT-gated origin), I4 (AST reserve), I5 (determinism), I8 (append-only causality). See `README.md` §2.

## 1. Purpose

Define how the commission produced by a **PoT-confirmed** process becomes **payment** to the nodes whose confirmed work the verdict named, and how the reserve share accrues to AST's own reserve. Payment is the causal effect of a verdict `verified === 1`: no verdict, no distribution (I3). This file applies the canonical split defined in `01_coin_engine/payment_distribution.md` at the point where PoT produces the verdict; it introduces no split of its own and adds no third destination.

Payment is compensation for work already confirmed — post-factum, retained by the earner. It is never an advance and never occurs without the confirming verdict (I3).

## 2. Principles (each derived)

- **Payment follows the verdict only (I1, I3).** The distribution reads a recorded `verified === 1` for the process and acts on it. *Because* the verdict is the sole cause of payment, there is no distribution without one and none before one.
- **Weighted by confirmed work, not possession (I3, I6).** Each node's share of the node pool is its PoT weight — a measure of confirmed work (`pot_tx_weighting_model.md`) — never a stake or holding, of which the model has none.
- **Two destinations, both internal (I4).** Commission divides into node payment and AST's own reserve — the only two things confirmed work causes. No external party is a destination.
- **Recorded before effect (I5, I8).** Each split is appended to NodeChain before value moves, so the distribution is reproducible.

## 3. Canonical split

Commission divides into exactly two destinations, both internal to AST:

| Recipient | Share | Address | Nature |
|---|---|---|---|
| **Node payment pool** | **75%** (`NODE_SHARE`) | `SYSTEM_NODE_POOL` | payment to nodes for confirmed work (I3) |
| **AST reserve** | **25%** (`RESERVE_SHARE`) | `SYSTEM_RESERVE` | accrual to AST's own reserve (I4) |

The split is fixed at two shares because confirmed work causes exactly two things: payment owed to the nodes that did it (I3) and accrual to the system's own reserve (I4). There is no external recipient, because a confirmed process gives the value no external owner (I1, I4). The node pool is then sub-distributed per node by PoT weight (§5).

## 4. Canonical formulas

```
commission        = processAmount × COMMISSION_RATE          (default 0.005)      [I3]
nodePool          = commission × NODE_SHARE                   (0.75 → nodes)       [I3]
reserveAccrual    = commission × RESERVE_SHARE               (0.25 → AST reserve) [I4]

payment_per_node  = nodePool × node_weight                                        [I3]
node_weight       = potScore(node) / Σ potScore(all active nodes)     Σ = 1.0     [I3]
```

`potScore` is defined in `pot_tx_weighting_model.md` and reads confirmed work only — never stake or holdings (I6).

## 5. Per-node distribution

Each active node receives a share of the **75% node pool** proportional to its confirmed contribution:

```
payment_per_node = nodePool × node_weight
node_weight      = potScore(node) / Σ potScore(all active nodes)
```

Weights normalize to `Σ node_weight = 1.0`, so the pool is apportioned, never inflated. *Because* I3 ties payment to executed work, the only admissible weighting input is confirmed work; a stake- or holding-weighted split would pay for possession, which the model has no cause for (I6).

## 6. Reserve accrual (the 25%)

- Accrues to `SYSTEM_RESERVE` — **AST's own** reserve (I4). It funds no external obligation and is owned by no external party.
- Recorded in NodeChain as `reserve.accrual { processId | epochId, amount }` (I8), for audit.
- **Does not drive `reserveIndex`.** The capitalization index is a function of confirmed process *volume* only (I‑RS‑1); the accrual is recorded value, not an index input. Feeding it into the index would double-count and break reproducibility (I5). See `01_coin_engine/coin_emission_model.md`.

## 7. Per-process vs epoch settlement

| Trigger | Split | When |
|---|---|---|
| Per confirmed process | 75/25 | at the verdict, `EmissionService` + `CommissionService` |
| Per epoch finalization | 75/25 | batched at epoch close, `CommissionService.finalizeEpoch()` |

Both apply the identical ratios and the identical causal chain. Batching changes *when* value moves, never *how much* or *why* (I5); the epoch total is exactly the sum of the per-process amounts it settles.

## 8. Worked example (10,000-unit process)

```
commission      = 10,000 × 0.005 = 50 ARO
nodePool        = 50 × 0.75      = 37.50 ARO   (sub-distributed by PoT weight across active nodes)
reserveAccrual  = 50 × 0.25      = 12.50 ARO   (accrued to AST's own SYSTEM_RESERVE)
```

Every unit above is traceable back through NodeChain to the verdict that caused it (I1, I5, I8); no unit is traceable to anything else, because nothing else is a cause.

## 9. Anti-abuse (each defends an invariant)

| Threat | Defense | Defends |
|---|---|---|
| Payment for non-work | payment gated on a recorded `verified === 1` | I1, I3 |
| Weighting by possession | weight uses confirmed work only, never stake/holdings | I3, I6 |
| A node paid for a false attestation | a challenged, corrected verdict produces no confirmed work → no payment | I1, I3 |
| Replayed settlement | each settlement cause is applied once (idempotent) | I5, I8 |

None of these confiscates or redistributes a balance; each ensures payment tracks confirmed work.

## 10. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_PAY_NO_VERDICT` | distribution attempted without a recorded `verified === 1` | I1, I3 |
| `E_PAY_FROM_POSSESSION` | a node's share computed from stake/holdings | I3, I6 |
| `E_RESERVE_EXTERNAL` | reserve share routed outside `SYSTEM_RESERVE` | I4 |
| `E_SPLIT_NOT_7525` | shares deviate from `NODE_SHARE`/`RESERVE_SHARE` | I3, I4 |
| `E_REPLAY_SETTLEMENT` | a settlement cause applied a second time | I5, I8 |

## 11. Oversight (I7)

The All-Seeing Eye observes every distribution and **vetoes** any that lacks a recorded confirmed-work cause, or that would route the reserve share outside `SYSTEM_RESERVE`. It authors no payment itself; it can halt a distribution but never fabricate one (I7).

## 12. Dependencies

- `01_coin_engine/payment_distribution.md` — the canonical 75/25 split this file applies.
- `pot_tx_weighting_model.md` — supplies `node_weight` for sub-distribution.
- `src/token/emission.service.ts`, `src/commission/commission.service.ts` — reference implementation.

## 13. Notes

- Distribution runs either per process at the verdict or batched at epoch close; the ratios and the causal chain are identical.
- Every split is a `PAYMENT_DISTRIBUTION` NodeChain entry, reproducible from the record (I5, I8) and observed by the Eye (I7).
