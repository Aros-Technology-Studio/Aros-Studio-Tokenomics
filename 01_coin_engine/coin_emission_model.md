# AROS Coin — Canonical Emission Model

**Stands on:** I1, I2, I3, I4, I5. See `README.md` §1. This document is the arithmetic of the cycle in `aro_emission_protocol.md`; it adds the reserve/capitalization math and proves each formula follows from an invariant.

## Overview

The emission model exists to make one thing true: **the amount of lasting ARO equals the amount of confirmed, paid-for work — and nothing else.** Every formula below is chosen because it is the unique arithmetic that keeps a causal chain closed. Where a traditional token would insert a policy (a cap, a schedule, a stabiliser), this model has an invariant instead, and the invariant fixes the formula.

## Core principles (each a direct reading of an invariant)

- **No pre-allocation.** No units at launch, none reserved for anyone. *Because* I1: with no confirmed process, there is no cause of a unit.
- **No fixed supply.** No hard cap. *Because* I6 leaves no object called "maximum supply"; supply is whatever confirmed activity has paid for.
- **1:1 process emission.** For a confirmed process of amount `A`, exactly `A` is minted as the process part. *Because* I2 requires the mint to be mirrored by an equal burn — any multiplier would leave residue and break net-zero.
- **Transient process part.** The minted `A` is burned on completion; net process supply change per cycle = 0. *Because* I2.

## Canonical emission formula

```
Emission (process part) = A                       (1:1, no multiplier)          [I1,I2]
Commission (earned)     = A × 0.005               (default COMMISSION_RATE)     [I3]
  Node payment          = Commission × 0.75       (→ nodes, by PoT weight)      [I3]
  Reserve accrual       = Commission × 0.25       (→ AST's own reserve)         [I4]
Burn                    = A                        (mirror of the mint)         [I2]
```

### Worked example — process amount 10,000 ARO

```
A            = 10,000 ARO
Emission     = 10,000 ARO   (minted as the process part, bound to the process)   [I1]
Commission   = 10,000 × 0.005 = 50 ARO                                            [I3]
  Node pay   = 50 × 0.75 = 37.50 ARO   (retained by contributing nodes)          [I3]
  Reserve    = 50 × 0.25 = 12.50 ARO   (accrued to AST's own reserve)            [I4]
Burn         = 10,000 ARO   (destroyed on completion)                            [I2]

Δ process supply  = 0            (10,000 minted, 10,000 burned)                   [I2]
Δ lasting supply  = +50 ARO      (only the earned/retained commission survives)  [I3]
```

Every number is forced: change the 1:1 and I2 breaks; change "retained" to "burned" and I3 breaks; route the 25% anywhere external and I4 breaks.

## Capitalization index and internal valuation

AST reports a capitalization index. It is **not a market price** (I6 — there is no market to quote); it is a monotone summary of how much confirmed work the network has processed.

```
reserveIndex   = log10(1 + totalProcessVolume)          [I4, I-RS-1, I-RS-4]
internalPrice  = base × reserveIndex
```

Why exactly this form, and no other:

- **Input is confirmed volume only (I‑RS‑1).** `totalProcessVolume` is the sum of `emission.minted` amounts recorded in NodeChain — i.e. confirmed work. No balance, no accrual, no external quote enters. *Because* if the 25% reserve accrual also fed the index, the same underlying transaction would be counted twice (once as volume, once as accrual), and I5 (reproducibility from canonical inputs) would fail on the double-count.
- **Never a free authority (I‑RS‑2).** No one may *set* the index; it is computed. A settable index would be a discretionary token movement, forbidden by I5.
- **Monotone non-decreasing (I‑RS‑4).** `log10(1 + x)` is monotone in `x ≥ 0`, and `totalProcessVolume` only grows (volume is appended, never removed — I8). Therefore the index can never fall as a lever; it tracks accumulated confirmed work.
- **Logarithmic on purpose.** Growth stays meaningful at scale without unbounded blow-up — a summary, not a speculation surface.

The 25% reserve accruals are recorded in NodeChain as `reserve.accrual` events for audit. They are **recorded value, not an index input** (I‑RS‑1); they answer "how much has AST's own reserve accrued?", not "what is the index?".

## What keeps supply honest (structural, not corrective)

There is no anti-inflation *mechanism*, because there is no inflation *surface* to fight (I6). Instead there are structural facts:

- **Born-and-burned (I2):** the large numbers — the process parts — never persist. Lasting supply grows only by the small earned part (I3), and only in proportion to confirmed work. Supply cannot outrun activity because activity is its only cause (I1).
- **Bounded, role-based rate (README §5):** `COMMISSION_RATE` moves only inside protocol bounds, by a role-based committee decision recorded on-chain — never by holders (I6), never unbounded (I3).

Note what is **absent by invariant**, not by omission: no deflationary burn-for-price, no velocity throttle, no supply ceiling, no correction burn. Each would presuppose a market price to manage; I6 denies the referent.

## Epoch-level settlement

Per-process accounting is exact; settlement is batched for efficiency (operational only). At each epoch finalization the accumulated commission is settled with the same canonical split:

- **75%** → node payment pool, sub-divided across active nodes by PoT-normalized weight (see `payment_distribution.md`).
- **25%** → AST's own reserve (`SYSTEM_RESERVE`), recorded as `reserve.accrual`.

Batching changes *when* value is moved, never *how much* or *why* — the causal chain and the arithmetic are identical to the per-process case (I5).

## Reference implementation (canonical code)

- Emission lifecycle: `src/emission/emission.service.ts` — `EmissionService`
  - `calculate(txAmount, commissionRate?)` — pure canonical formula, no side effects
  - `emit(processId, amount)` — full PoT-gated lifecycle; returns `EmitResult`
  - `mint(processId, amount)` — mints the process part; throws unless the PoT verdict is `verified === 1` (I1)
  - `burn(processId, amount)` — burns the process part on completion; records the burn in NodeChain (I2, I8)
  - `totalSupply()` — supply derived from the ArosCoin ledger (I2 identity)
- Reserve index: `src/reserve/reserve.service.ts` — `ReserveService.reserveIndex()` (volume-only, I‑RS‑1)
- Commission split: `src/commission/commission.service.ts` — `CommissionService.finalizeEpoch()`

⸻
