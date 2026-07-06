# ArosCoin — Use Cases

**Stands on:** I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment), I4 (AST reserve), I6 (no speculative surface). See `README.md` §1.

## Purpose

State what ARO is *for*. Because I1 gives ARO a single cause (confirmed work) and I6 removes every speculative surface, ARO's uses are few, exact, and all downstream of confirmed work. This document derives each use from an invariant, so the list is not a menu of features but the closed set of things ARO can causally be. Where a general-purpose token would list markets, gateways, and holdings, ARO has confirmed processes and payment — and nothing that has no cause here.

---

## The two things ARO *is*

Everything ARO does reduces to these two, and both originate in the same confirmed work.

### 1. The unit that carries confirmed process value (born-and-burned)

When a process `P` of amount `A` is confirmed by PoT, `A` ARO is minted as the **process part** — the representation of the value moving through `P` — and burned when `P` completes (I1, I2). 

- **Use:** ARO is the medium in which one confirmed process's value is expressed while it is in flight.
- **Property:** it is transient by construction. It is never a balance to accumulate, because the process part that carries value is destroyed on completion (I2). ARO here is a *verb* — value moving — not a *noun* to be hoarded.

### 2. The unit of payment for confirmed work (retained)

The commission earned on a confirmed process is paid in ARO to the nodes that did the work, and accrues in part to AST's own reserve (I3, I4).

- **Use:** ARO is how AST pays for the confirmed work that keeps the network running.
- **Property:** this is the *only* ARO that persists — the earned, retained part (I3). It exists because work was done and confirmed; it exists in exactly the amount that work earned.

That is the whole of what ARO is: value-in-flight (destroyed on completion) and payment-for-work (retained). Every legitimate use is an instance of one of these.

---

## Concrete uses, each traced to a cause

| Use | What happens | Caused by / invariant |
|---|---|---|
| Settle a confirmed process | mint process part `A`, then burn on completion | PoT verdict (I1), born-and-burned (I2) |
| Pay a node for confirmed work | credit `commission × 0.75` to contributing nodes, retained | confirmed work (I3) |
| Accrue AST's own reserve | credit `commission × 0.25` to `SYSTEM_RESERVE` | confirmed work (I4) |
| Audit value flow | reconstruct any mint/burn/payment from NodeChain | append-only causality (I8) |

Every row begins with confirmed work. No row begins with a purchase, a deposit, a market order, or a holding — because none of those is a cause in this model (I1).

---

## What ARO is deliberately **not** (each has no object here)

These are not restrictions layered on top of a general token; they are absences forced by the invariants. Listing them makes the closure explicit.

- **Not a bridge or gateway to external value.** ARO does not tokenize or de-tokenize outside value; it has no fiat or external-crypto counterpart in this layer. Its only origin is confirmed AST work (I1); an external inflow is not a cause.
- **Not a governance token.** Holding ARO grants no vote, no proposal power, no privileged access. Governance in AST is role-based and recorded on-chain (I8); a balance confers nothing (I6). A held amount is either transient (I2) or earned-and-retained payment (I3) — neither is a franchise.
- **Not a staking or access instrument.** There is no "lock ARO to validate," no "stake to earn," no "hold to unlock services." Participation and standing track confirmed work, not locked capital (I3, I6). Access is by identity and role, not by balance.
- **Not a speculative or yield asset.** There is no market price to trade against (I6), no passive earning on a balance, no liquidity pool, no reserve one contributes to for return. The reserve is AST's own (I4), not a public yield venue.

Each "not" is the shadow of an invariant: remove the invariant and the use would have an object; keep it and the use has none.

---

## Summary

ArosCoin is the unit of *confirmed process value* and of *payment for confirmed work* — and only those. Its uses are exactly the uses those two roles cause, no more, because I1 admits one cause and I6 removes every surface on which additional uses would otherwise stand. Every ARO in existence is either value in flight about to be burned (I2) or payment that some node earned by working (I3); there is no third kind, and therefore no third use.
