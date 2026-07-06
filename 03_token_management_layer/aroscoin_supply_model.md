# aroscoin_supply_model.md

**Stands on:** I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment), I4 (AST reserve), I5 (determinism), I6 (no speculative surface). See `README.md` §1.

## Purpose

State what the ArosCoin supply *is*, and derive it. The honest description of AST's supply is not a schedule, an allocation table, or a cap — it is an **identity**: the total supply at any instant is a function of the confirmed work recorded in NodeChain, and of nothing else. There is no monetary policy to set because there is no free variable to set; supply is a *derived quantity*, not a governed one.

---

## 1. The supply identity (the whole model)

```
totalSupply = (processMinted − processBurned) + earnedRetained
```

Two terms, each with a single cause:

- **`processMinted − processBurned`** — the live process part. Because every mint is mirrored by a burn at the close of the same cycle (I2), this term is `0` for every completed process and is transiently positive only for processes in flight. It never accumulates.
- **`earnedRetained`** — the sum of all commission paid for confirmed work and retained (I3). This is the only lasting term.

*Because* the first term converges to zero (I2), **`totalSupply` converges to `earnedRetained`.** Therefore all lasting supply is confirmed, paid-for work (I3) caused by PoT verdicts (I1) — and nothing else. Supply is not a number chosen at genesis and released over time; it is the running total of work the network has actually confirmed.

---

## 2. Why there is no maximum supply

A hard cap (`maxSupply`) presupposes a **schedule of issuance** that could run up against a ceiling — a stock of pre-decided units being released. Trace whether AST has such a stock:

1. Units are not pre-decided; each is caused, one at a time, by a `verified === 1` verdict (I1).
2. The large flows (process parts) are born and burned and never accumulate into a stock (I2).
3. The lasting supply is exactly the paid-for work already done (I3) — a *record*, not a *reservoir*.

**Therefore a cap has no object here.** There is no reservoir to cap, no schedule to bound, and no ceiling that supply could approach — because supply is not "released toward a limit," it is "accumulated from confirmed work." A `maxSupply` field would name a quantity the model does not contain (I6). Its absence is not a missing safeguard; the safeguard a cap *reaches for* — that supply cannot inflate freely — is delivered unconditionally by I1: supply cannot outrun confirmed work.

---

## 3. Why there is no genesis allocation, no vesting, no distribution table

An allocation table (genesis reserve, development fund, treasury, private/public rounds) presupposes units that exist *before* any work confirms them. Under I1 no such unit can exist: with no verdict there is no unit. Therefore:

- there is no genesis mint and no pre-mine;
- there is no founder/investor/treasury allocation to lock or vest (see `token_lock_unlock_rules.md`);
- there is no "initial circulation" to release gradually.

The concept these tables encode — *deciding who holds supply before the network has done work* — has no object in a model where supply is a consequence of work (I1, I6).

---

## 4. Why supply is non-inflationary by construction

"Non-inflationary" here is not a target defended by burns or throttles; it is a property of the identity in §1:

- **Process parts cannot inflate supply (I2):** they net to zero each cycle.
- **Lasting supply grows only with confirmed work (I1, I3):** `earnedRetained` rises by exactly the commission paid for work actually done. There is no idle emission, no emission curve, and no bonus issuance to dilute it.
- **The valuation reference tracks work, not a market (I4):** `reserveIndex = log10(1 + totalProcessVolume)` is computed from confirmed volume, monotone non-decreasing (I‑RS‑4), never set as a free authority (I‑RS‑2).

There is therefore no deflation engine, velocity throttle, or overflow burn (those defend a market price and a circulating float — see `burn_mechanism.md` §4 and `token_supply_governance.md`). The soundness they reach for is structural here.

---

## 5. Supply visibility (a read of the record, never a control)

Supply figures are *derived reads* of NodeChain, reproducible on any node (I5):

| Reported quantity | Definition | Cause |
|---|---|---|
| Live process part | `processMinted − processBurned` (→ 0 at rest) | I2 |
| Lasting supply | `earnedRetained` | I1, I3 |
| Total burned (process parts) | `processBurned` | I2 |
| Reserve accrual | cumulative `RESERVE_SHARE` of commission | I4 |
| `reserveIndex` | `log10(1 + totalProcessVolume)` | I4 |

These are observations, not levers. Reading a supply figure changes nothing; there is no dashboard control that mints, burns, or rebalances supply, because there is no free supply variable to move.

---

## 6. Canonical values

```
totalSupply        = (processMinted − processBurned) + earnedRetained
processMinted       ── caused only by verified===1 verdicts            [I1]
processBurned       ── mirrors each mint at cycle close                 [I2]
earnedRetained     += Commission per completed cycle                    [I3]
Commission          = A × 0.005          (bounds [0, 0.01])            [I3]
maxSupply           = (none — no object, I6)
initialSupply       = (none — no object, I1)
```

---

## Linked Documents

- `token_issuance_protocol.md`
- `burn_mechanism.md`
- `token_supply_governance.md`
