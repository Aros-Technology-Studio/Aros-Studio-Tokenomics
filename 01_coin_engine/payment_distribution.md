# Payment Distribution for AST Node Infrastructure

**Stands on:** I3 (payment for confirmed work), I1 (PoT-gated origin), I4 (AST reserve), I5 (determinism), I8 (append-only causality). See `README.md` §1.

## Purpose

Define how the commission produced by confirmed processes becomes **payment** to the nodes that did the work, and how the reserve share accrues to AST's own reserve. Every distribution is the causal effect of confirmed work; no distribution precedes work, and none occurs without a recorded PoT verdict. It is payment for executed work: it follows the work, and only the work (I3).

---

## 1. Where the distributed value comes from

| Source | Definition | Caused by |
|---|---|---|
| `commission` | `A × COMMISSION_RATE` for a confirmed process of amount `A` | a PoT verdict `verified === 1` (I1) |
| `epoch_settlement` | the sum of per-process commissions accrued over an epoch | the same verdicts, batched (operational only) |

There is no third source. In particular there is **no** pool funded by confiscated balances or governance-directed reallocation: a node that fails simply produces no confirmed work and is therefore paid nothing (I3), which is exclusion by absence of cause, not a transfer of someone else's balance.

---

## 2. Canonical split

Commission divides into exactly two destinations, both internal to AST:

| Recipient | Share | Address | Nature |
|---|---|---|---|
| **Node payment pool** | **75%** | `SYSTEM_NODE_POOL` | payment to nodes for confirmed work (I3) |
| **AST reserve** | **25%** | `SYSTEM_RESERVE` | accrual to AST's own reserve (I4) |

The node pool is then sub-distributed to individual nodes by PoT-normalized weight (§3). The split is fixed: it is two shares because there are exactly two things confirmed work causes — payment owed to the workers (I3) and accrual to the system's own reserve (I4). No external party is a destination, because confirmed work gives the value no external cause or owner (I1, I4).

---

## 3. Per-node distribution (from the node pool)

Each active node receives a share of the **75% node pool** proportional to its confirmed contribution:

```
payment_per_node = nodePool × node_weight

node_weight = potScore(node) / Σ potScore(all active nodes)

potScore = f(confirmed_tx_count, validations, reliability)     (see node_participation_payments.md)
```

Weights are normalized so `Σ node_weight = 1.0`. The weighting is a measure of **work actually confirmed by PoT** — not of stake, not of holdings, not of tenure. *Because* I3 ties payment to executed work, the only admissible weighting input is confirmed work; a stake- or holding-weighted split would pay for possession, which the model has no cause for (I6).

---

## 4. Reserve accrual (the 25%)

- Accrues to `SYSTEM_RESERVE` — **AST's own** reserve (I4). It funds no external obligation and is owned by no external party.
- Recorded in NodeChain as `reserve.accrual { processId | epochId, amount }` (I8), for audit.
- **Does not drive `reserveIndex`.** The capitalization index is a function of confirmed process *volume* only (I‑RS‑1); the accrual is recorded value, not an index input. Feeding the accrual into the index would double-count the same transactions and break reproducibility (I5). See `coin_emission_model.md`.

---

## 5. Per-process vs epoch settlement

| Trigger | Split | Implementation |
|---|---|---|
| Per confirmed process | 75/25 | `EmissionService` + `CommissionService` |
| Per epoch finalization | 75/25 | `CommissionService.finalizeEpoch()` |

Both apply the identical ratios and the identical causal chain. Batching changes *when* value moves, never *how much* or *why* (I5) — the epoch total is exactly the sum of the per-process amounts it settles.

---

## 6. Anti-abuse (each defends an invariant)

| Threat | Defense | Defends |
|---|---|---|
| Payment for non-work | payment is gated on a recorded `verified===1` verdict | I1, I3 |
| Weighting by possession | weight uses confirmed work only, never stake/holdings | I3, I6 |
| Node cartelization | per-node cap on pool share, bounded and role-set | I3 |
| Fake/idle nodes | heartbeat + rotation; no confirmed work ⇒ no weight ⇒ no payment | I3 |
| Replayed settlement | each settlement cause is applied once (idempotent) | I5, I8 |

None of these confiscates or redistributes a balance; each simply ensures payment tracks confirmed work.

---

## 7. Oversight

- **The All-Seeing Eye** observes every distribution and **vetoes** any that is not backed by a recorded confirmed-work cause, or that would route the reserve share outside `SYSTEM_RESERVE` (I7). It authors no payment itself.
- **`COMMISSION_RATE`** is adjustable only within protocol bounds by the role-based committee, recorded on-chain before effect (I8) — never by holder vote (I6).
- A distribution can be **halted** (Eye veto or circuit breaker) but never **fabricated**: there is no path that creates payment without a confirmed-work cause.

---

## 8. Summary

The 75/25 split is the minimal arithmetic that satisfies two invariants at once: nodes are paid for the work they confirmably did (75%, I3), and AST's own reserve accrues from that same confirmed activity (25%, I4). Every distributed unit is traceable back through NodeChain to the PoT verdict that caused it (I1, I5, I8); no unit is traceable to anything else, because nothing else is a cause.
