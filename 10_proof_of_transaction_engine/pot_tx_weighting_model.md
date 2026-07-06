# PoT Transaction Weighting Model

**Stands on:** I3 (payment for confirmed work), I5 (determinism), I6 (no speculative surface), I8 (append-only causality). See `README.md` §2.

## 1. Purpose

Define how a positive PoT verdict credits **whose** confirmed work — the normalized weight each participating node carries into the payment split. A verdict of `verified === 1` names a body of confirmed work; the weighting model apportions that work among the nodes that produced it, so the 75% node pool (`pot_tx_payment_distribution.md`) can be sub-distributed. *Because* I3 ties payment strictly to executed, confirmed work, the only admissible input to a weight is confirmed work recorded in NodeChain — never a stake, a holding, or a tenure, none of which exist as objects in this model (I6).

## 2. Principles (each derived)

- **Weight measures confirmed work, nothing else (I3).** A node's weight is a summary of what PoT has already confirmed it did. It is not a bid, not a balance, not a deposit. *Because* I6 leaves no held stake or speculative supply, there is no possession-quantity a weight could read; a weight that referenced one would be reading a variable that does not exist.
- **Deterministic (I5).** A node's weight is a pure function of its recorded confirmed-work history. Any node replaying the record computes the same weight.
- **Recorded before use (I8).** The confirmed-work events a weight sums are on-chain before the weight is applied to a payment.

## 3. Weight components

A node's PoT weight combines three recorded, confirmed-work measures. Each is derived from the record; none is a market or possession quantity.

| Component | Definition | Why admissible |
|---|---|---|
| **Contribution** | volume of confirmed work the node executed (confirmed process count / value it participated in) | direct measure of executed, confirmed work (I3) |
| **Reliability** | `1 − (unconfirmed_attempts / total_attempts)`, capped at 1 | measures how much of the node's work the record actually confirmed (I3) |
| **Context** | current NodeChain load factor the node served under (e.g. shard density) | normalizes work done under heavier recorded load; operational, from the record (I5) |

There is deliberately **no** "amount held," "stake," or "deposit" component: I6 gives them no object, so they cannot be inputs.

## 4. The weight function

```
potScore(node) = w_c · Contribution + w_r · Reliability + w_x · Context

    Contribution = log(1 + confirmed_work_volume)     (dampens large single processes)
    Reliability  = 1 − (unconfirmed_attempts / total_attempts)     (capped at 1)
    Context      = avg_load / node_load               (credits work under heavier recorded load)

    default coefficients:  w_c = 0.5,  w_r = 0.3,  w_x = 0.2     (Σ = 1)
```

The per-node payment weight is the normalization across all active nodes:

```
node_weight = potScore(node) / Σ potScore(all active nodes)          Σ node_weight = 1.0
```

*Because* the weights are normalized to sum to 1, the model apportions the fixed 75% node pool — it never inflates it. The coefficients `w_c, w_r, w_x` are bounded parameters set by the role-based committee within protocol bounds (I5, I8); they may reshape *how confirmed work is measured*, never introduce a possession input, because I6 admits none.

## 5. Reference behaviour

```python
import math

def pot_score(node: dict, coeff: dict) -> float:
    contribution = math.log(1 + node["confirmed_work_volume"])
    total = node["total_attempts"] or 1
    reliability = min(1.0, 1.0 - node["unconfirmed_attempts"] / total)
    context = node["avg_load"] / (node["node_load"] or 1)
    return (coeff["c"] * contribution
            + coeff["r"] * reliability
            + coeff["x"] * context)

def node_weights(nodes: list[dict], coeff: dict) -> dict:
    scores = {n["id"]: pot_score(n, coeff) for n in nodes}
    total = sum(scores.values()) or 1.0
    return {nid: s / total for nid, s in scores.items()}   # Σ = 1.0
```

No parameter of `pot_score` reads a balance, a stake, or a deposit — there is nothing of the kind to read (I6).

## 6. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_WEIGHT_FROM_POSSESSION` | a weight input references stake/holdings/deposit | I3, I6 |
| `E_WEIGHT_UNNORMALIZED` | `Σ node_weight ≠ 1.0` | I3 |
| `E_WEIGHT_NOT_REPRODUCIBLE` | replay of the record yields a different weight | I5 |
| `E_WEIGHT_UNRECORDED_INPUT` | a weight summed an event not on-chain | I8 |

## 7. Dependencies

- `pot_tx_payment_distribution.md` — consumes `node_weight` to sub-distribute the 75% node pool.
- `pot_node_role_assignment.md` — uses the same `potScore` to order participation eligibility.
- `02_nodechain_engine/` — supplies the recorded confirmed-work history (I8).

## 8. Notes

- Weight is standing earned by confirmed work; it is measured, never purchased, and cannot be seized (there is nothing held to seize — I6). A node that stops producing confirmed work sees its weight lapse toward zero by absence of contribution, not by penalty.
- The role-based committee may tune `w_c, w_r, w_x` within bounds (I8, recorded before effect); it cannot add a possession input.
