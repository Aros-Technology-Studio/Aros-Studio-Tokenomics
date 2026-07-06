# Node Payment Allocation

**Stands on:** I3 (payment for confirmed work), I4 (reserve is AST's own), I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality). See `README.md` §1.

## Purpose of this document

Define how the **node share of commission** is split among the nodes that confirmably did the work of a settlement batch. Payment in AST is one thing only: *compensation, post-factum, for executed PoT-confirmed work* (I3). This document derives the split formula from that fact. It is **not** mining, **not** staking, and **not** based on uptime, coin holdings, or any pledge (I6).

---

## 1. Conceptual overview

A node is paid **proportionally to the confirmed work it contributed** to processing a transaction — not for being online, not for holding ARO, not for a deposit. The paid amount comes from the **node share of commission** (`NODE_SHARE = 0.75` of the `COMMISSION_RATE = 0.005` charged on the process amount; the remaining `RESERVE_SHARE = 0.25` accrues to AST's own reserve — I4). Payments are denominated in ArosCoin and resolve to integer `arx` (`1 ARO = 10^9 arx`).

**The weight of a node's claim is a function of confirmed contribution:**
- number of transaction fragments it confirmably encrypted/validated (recorded signatures — `shard_signature_model.md`);
- its reputation and confirmation accuracy, computed deterministically from the record (I5);
- participation-fairness bounds that spread work across nodes (anti-monopoly), never bought.

*Because* payment follows confirmed work (I3), a node with no recorded confirmations for a batch is paid nothing in it — not as a penalty, but because there is no work to pay for.

---

## 2. Why payment cannot precede or exceed confirmed work — derived

*Because* I3 makes payment the causal *effect* of confirmed work, **therefore** two rules follow with no exceptions:

1. **No payment before confirmation.** A node's claim is computed only from signatures already appended to NodeChain for the batch (I8). There is no advance and no draw.
2. **No payment without confirmation.** Uptime, standby, holdings, or a pledge produce no claim — none of them is confirmed work (I3), and holdings confer nothing at all (I6).

Payment is exactly the node share of commission, split by confirmed contribution — with nothing added on top. Any value moving for a cause other than confirmed work is a movement I3 does not admit.

---

## 3. Payment formula

Let, for a settlement batch (epoch `POT_EPOCH_SECS = 600`):

- `C` = total commission charged on the batch's process amounts = `Σ process_amount × COMMISSION_RATE`
- `R = C × NODE_SHARE` = the node payment pool for the batch (the reserve pool `C × RESERVE_SHARE` goes to AST's own reserve — I4)
- `Wi` = confirmed-contribution weight of node *i*
- `ΣW` = total confirmed-contribution weight across all participating nodes

Then node *i*'s payment `Ri`:

```math
Ri = (Wi / ΣW) × R
```

where `Wi` is derived only from **recorded, confirmed** quantities:

- count of shards node *i* confirmably signed (`shard_signature_model.md`);
- confirmation accuracy (fraction of its signatures that reached quorum with matching hashes — I5);
- confirmation latency within the allowed window (a node outside the window did not contribute a valid confirmation, so that work does not weight — I5).

*Because* every input to `Wi` is a pure function of the append-only record (I5, I8), any auditor recomputes the identical split; the allocation is reproducible on every node.

---

## 4. Example allocation (one batch, node pool R = R arx)

| Node ID | Confirmed weight `Wi` | Share of ΣW | Payment `Ri` (of pool R) |
|---|---|---|---|
| node_431 | 1.5 | 30% | 0.30 · R |
| node_882 | 1.0 | 20% | 0.20 · R |
| node_217 | 2.5 | 50% | 0.50 · R |
| **Total** | **5.0** | **100%** | **R** |

The pool `R` is itself `C × NODE_SHARE` for the batch (§3), so the entire distribution traces back to commission on confirmed processes — nothing is created outside that chain (I1, I3).

---

## 5. Fairness and anti-monopoly bounds

These bounds shape *how work is distributed*, so no node can capture a batch — they never add payment for unconfirmed work:

- **Rotation:** a node's eligibility excludes it from consecutive rounds for the same transaction, spreading confirmed work and visibility (`encryption_protocol.md` §5).
- **Contribution ceiling:** per-node load is bounded by NodeAuth (`node_registration_and_auth.md` §5), capping any one node's `Wi` share of a batch.
- **Reputation decay:** a long-inactive node's reputation decays deterministically from the record (I5); it must resume confirmed work to regain weight (I3).

A node that drops a payload mid-process simply fails to produce the confirming signatures for that shard, so that shard does not weight into its `Wi` — the "penalty" is the absence of payment for work not confirmed (I3), not a fine on a held balance (there is none — `node_registration_and_auth.md` §2).

---

## 6. Payment mechanism

- Payments are made in **ArosCoin (ARO)**, resolved to integer `arx`.
- Distribution is handled by AST's **internal settlement**, batched per epoch (`POT_EPOCH_SECS = 600`) to settle many confirmed contributions at once. There is no external chain and no external fee to pay; settlement is internal to AST.
- Every payment is appended to NodeChain **after** its confirming work and **before** it is acknowledged as credited (I8), so each credit names the confirmed work that caused it (I1, I3).

```
// Pseudocode — payment is gated on recorded confirmed work
for node in batch.participants:
    Wi = confirmed_weight(node, batch)          // pure function of the record (I5)
    if Wi > 0 and eye_veto(node, batch) == false: // Eye may halt, never initiate (I7)
        Ri = (Wi / sumW) * (batch.commission * NODE_SHARE)
        append_payment(node.identity, Ri)        // appended before ack (I8)
```

The Eye observes settlement and can veto a credit that would violate an invariant; it never authors a payment (I7).

---

## 7. Reserve share (for completeness)

Of the commission `C`, the fraction `RESERVE_SHARE = 0.25` does **not** enter the node pool; it accrues to **AST's own reserve** (I4) and belongs to no external party. Node payment and reserve accrual are two disjoint destinations of the same commission, each traceable to confirmed process volume (I3, I4). See `01_coin_engine/payment_distribution.md`.

---

## 8. Repository location

```
02_nodechain_engine/
└── node_payment_allocation.md
```
