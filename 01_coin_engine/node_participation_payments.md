# node_participation_payments.md

**Stands on:** I3 (payment for confirmed work), I1 (PoT-gated origin), I5 (determinism), I6 (no speculative surface), I8 (append-only causality). See `README.md` §1.

## I. Purpose

Define how the node pool (the 75% node share of commission — see `payment_distribution.md`) is turned into a **payment per node**, in proportion to the work each node confirmably contributed. This document is about compensation for executed work only, because I3 recognises exactly one cause of a payment — confirmed contribution — and one relation to it — payment *after* the fact.

## II. Scope

Applies to all verified nodes participating in the decentralized processing, encryption, and validation of transactional data on the AST NodeChain. The mechanism exists to answer one question deterministically: *given the confirmed work in an epoch, how much of the node pool does each node receive?*

⸻

## III. Payment structure (derived, not designed)

**1. Payment follows confirmed work.**
Each confirmed process yields commission (I1, I3); the node share is split across the nodes that contributed to confirming it. A node that contributed nothing confirmable receives nothing — not as a penalty, but because there is no cause for a payment to it (I3).

**2. Contribution is measured, then paid.**
Nodes are scored by a **Node Performance Index (NPI)** — a *measurement* of contribution quality, used solely to divide payment fairly:

```
NPI = (uptime_score × availability_weight
       + latency_score × latency_weight
       + reliability_score) ÷ (availability_weight + latency_weight + 1)
```

The NPI is not a multiplier applied to a held balance and confers no standing balance; it is only the weight by which already-earned commission is apportioned among the nodes that earned it. *Because* payment must track work (I3), the apportioning key must be a work measure — uptime, latency, and reliability are properties of work delivered, not of capital held (I6).

**3. Eligibility by confirmed participation.**
A node is eligible for a given epoch's pool iff it confirmably participated in that epoch (recorded in NodeChain, I8). There is **no minimum stake and no deposit-to-earn**: participation is by identity + delivered work, not by locked capital (I6). Eligibility is thus a fact about work, verifiable from the chain, not a purchased status.

⸻

## IV. Payment calculation

```mermaid
flowchart TD
    A[Epoch closes: confirmed processes known] --> B[Identify contributing nodes per process  I1]
    B --> C[Measure NPI for each node from recorded work  I8]
    C --> D[node_weight = NPI_i / Σ NPI  (normalized to 1.0)]
    D --> E[payment_per_node = nodePool × node_weight  I3]
    E --> F[Credit payment; append to NodeChain payment ledger  I8]
```

Every input to this computation is a recorded fact of the epoch (I8), so any node can reproduce every node's payment independently (I5). Payment is **post-factum**: it is computed only after the epoch's work is confirmed and closed (I3).

⸻

## V. Non-payment conditions (absence of cause, not confiscation)

| Condition | Consequence | Why (invariant) |
|---|---|---|
| Uptime < 80% (rolling 30d) | reduced/temporary ineligibility for the affected epochs | less confirmed work ⇒ less/no payment cause (I3) |
| Sustained NPI drop | smaller share of the pool | share tracks measured contribution (I3) |
| Proven malicious behavior | excluded; forfeits *pending* (not-yet-earned) payment | payment requires confirmed honest work; there is none (I1, I3) |

None of these takes an already-earned, retained balance from a node. A node keeps what it earned (I3, P6); it simply does not earn where it did not confirmably work. There is no slashing of a held stake, because there is no held stake (I6).

⸻

## VI. Payout cycle

- Payments are computed per confirmed process but **settled in batches** every epoch (reference `POT_EPOCH_SECS`, batched further to a payout interval for efficiency).
- Batching is operational only: the batched total equals the sum of the per-process amounts it settles (I5).
- Every payout and its per-node split are appended to the immutable payment ledger in NodeChain (I8).

⸻

## VII. Transparency and audit

Auditing node payment is re-deriving it from the chain:

- Node leaderboard (NPI and payments) is reconstructable from recorded epoch facts.
- Per-payout audit trail: each split is reproducible from the same inputs on any node (I5).
- Every credited payment is preceded by the confirmed-work cause that produced its commission (I1, I3); a payment with no such antecedent is an invariant violation and is **vetoed** by the All-Seeing Eye before acknowledgement (I7).
