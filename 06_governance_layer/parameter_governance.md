# parameter_governance.md

**Stands on:** I1 (PoT-gated origin), I3 (payment for confirmed work), I5 (determinism), I6 (no speculative surface), I7 (Eye: observe and veto), I8 (append-only causality). See `README.md` §1.

## 1. Purpose

Define the *complete* procedure by which a bounded parameter is changed. There is exactly one economic parameter that can change — `COMMISSION_RATE` — and it can change only within protocol-defined bounds. This document replaces proposal/quorum/voting with a **deterministic, bounded, auditable** procedure: a value is either inside the bound (and recorded before effect) or it is rejected. Nothing is counted, and no one is polled.

---

## 2. The one governable parameter and its bound

| Parameter | Default | Bound | Governable by |
|---|---|---|---|
| `COMMISSION_RATE` | `0.005` | `rateBounds = [0, 0.01]` | Parameter Committee |

Every other constant is fixed (`README.md` §4): `SYMBOL`, `DECIMALS`, `BASE_UNIT`, `NODE_SHARE`, `RESERVE_SHARE`. They are not "hard to change" — they are *not parameters*, because changing them would change an axiom (I1, I5), not tune a value.

**Why this bound, derived.** Commission on a process of amount `A` is `C = A × COMMISSION_RATE`, split into node payment and reserve accrual (I3, I4). A rate above `0.01` is still well below `1`, but the *upper edge* of what the model permits is fixed at `0.01` so the earned part stays a small share of `A` and can never approach or exceed the process amount, which would contradict I3 (payment must be *for* the work, not a levy that consumes it). A rate of `0` is admissible — it simply means no commission is charged for a cycle, which breaks no invariant (the process part still mints and burns to zero, I2). *Therefore* `[0, 0.01]` is exactly the range over which no causal chain can break; a value outside it has no object in the model.

---

## 3. The procedure (deterministic, not a vote)

A change is a single recorded act with two guards and a veto window. There is no ballot, no counting, no threshold of participants.

```mermaid
flowchart TD
  A[Parameter Committee proposes COMMISSION_RATE = r] --> B{r within rateBounds [0, 0.01]? I5}
  B -- no --> R[REJECT · E_RATE_OUT_OF_BOUNDS · nothing recorded]
  B -- yes --> C[append intent to NodeChain · pre-acknowledgement window I8]
  C --> D{Eye: would r violate I1–I6? I7}
  D -- yes --> V[VETO · E_VETOED · acknowledgement withheld]
  D -- no --> E[append governance.paramSet{param, from, to, by, at} I8]
  E --> F[only then is r the rate in force I8]
```

1. **Propose.** The Parameter Committee (and only it, `governance_roles_and_permissions.md` §3) proposes a value `r`.
2. **Bound check (I5).** Is `r ∈ [0, 0.01]`? This is a pure predicate on `r`, not a poll. If false, the act is rejected with `E_RATE_OUT_OF_BOUNDS` and **nothing is recorded** — an out-of-bounds value never reaches the ledger.
3. **Veto window (I7, I8).** The intent sits in the pre-acknowledgement window. The Eye evaluates it against I1–I6 and may veto (`E_VETOED`), withholding acknowledgement. The Eye authors nothing; it only withholds.
4. **Record before effect (I8).** If not vetoed, `governance.paramSet { param, from, to, by, at }` is appended to NodeChain.
5. **Effect (I8).** Only after the record exists does `r` become the rate in force. Every process settled after this point uses `r`; every process before it used the prior value.

Determinism (I5): given the same `paramSet` records, every node computes the same rate-in-force for every process, every time.

---

## 4. Why this replaces proposals, quorum, and voting

Each discarded mechanism is a concept with **no object** here, not a feature turned off.

- **No proposal lifecycle.** The old model staged a draft through submission, quorum, voting, and execution. Here the "proposal" is a single value `r` checked against a bound; there are no stages because there is nothing to deliberate — either `r` is inside `[0, 0.01]` or it is not. The lifecycle collapses into one predicate.
- **No quorum.** Quorum is the number of voters required to make a decision valid. With no voters (I6 leaves governance-by-holding no object), there is no count to reach a threshold. Validity is instead the bound check (§3.2), which needs no participants.
- **No token-weighted vote.** A vote weighted by holdings would treat a held balance as a ballot. A held balance is retained payment for past confirmed work (I3), not a franchise (I6). *Therefore* there is nothing to weigh and no vote to hold.
- **No governance token.** There is no separate franchise asset; I1 admits no cause that could mint one and I6 admits no object it could be. The procedure runs on roles and bounds, not on a token.

What remains is smaller and stronger: a bounded predicate, a veto window, and a record that precedes effect.

---

## 5. The record

A parameter change appends exactly one canonical record, and its effect is nothing more than that record existing (I8):

```json
{
  "type": "governance.paramSet",
  "param": "COMMISSION_RATE",
  "from": 0.005,
  "to": 0.004,
  "by": "role:ParameterCommittee",
  "at": "<nodechain-sequence>"
}
```

- `from` and `to` make the change fully reconstructable; `to` is guaranteed within `rateBounds` because an out-of-bounds value is never recorded (§3.2).
- `by` names the **role**, never an ARO holder — authority is a role, not a balance (I6).
- `at` places the record in NodeChain sequence, so the rate in force for any process is the `to` of the latest `paramSet` recorded *before* that process (I8). The change is reproducible (I5) from this record alone.

There is no `voteWeight`, no `quorumReached`, no `proposalId`, and no `voterSet` field — none has an object in the model (§4).

---

## 6. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_RATE_OUT_OF_BOUNDS` | proposed `r ∉ [0, 0.01]` | I5 (bounded change) |
| `E_UNAUTHORIZED_ROLE` | a role other than the Parameter Committee attempts a `paramSet` | I5, I7 |
| `E_VETOED` | the Eye vetoes the change in the pre-acknowledgement window | I7 |
| `E_EFFECT_BEFORE_RECORD` | a rate is applied for which no prior `paramSet` exists | I8 |
| `E_IMMUTABLE_CONSTANT` | an attempt to `paramSet` `DECIMALS`, `SYMBOL`, `BASE_UNIT`, or the split | I1, I5 |

Each code names an impossible state so it can be caught, not merely avoided.

---

## 7. What auditing checks

- **Bounded (I5):** every `paramSet.to` lies within the parameter's protocol bounds.
- **Recorded before effect (I8):** the rate applied to any process equals the `to` of the latest `paramSet` recorded before that process; no earlier application exists.
- **Role-issued (I6, I7):** every `paramSet.by` is `role:ParameterCommittee`; none is an ARO holder.
- **Reproducible (I5):** replaying the `paramSet` sequence reconstructs the exact rate-in-force history.

---

## 8. Next

- `emergency_governance_procedures.md` — the halt / circuit breaker, engaged by the Eye's veto together with a role committee, never by a single authority.
