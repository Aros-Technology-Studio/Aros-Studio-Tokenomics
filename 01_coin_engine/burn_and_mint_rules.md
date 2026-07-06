# ArosCoin — Mint and Burn Rules

**Stands on:** I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment), I4 (AST reserve), I5 (determinism), I8 (append-only causality). See `README.md` §1.

## Purpose

Define the *complete* set of state transitions the supply may undergo, and the guard on each. There are exactly two transitions — mint and burn — and each is causally bound to a confirmed process. Any issuance mode outside this gate does not exist in the model, because I1 recognises no cause but a PoT verdict. This document is the truth table of that closure.

---

## 1. Mint — when and how

### Allowed trigger (the only one)

A mint is authorized **iff** PoT has recorded a verdict `verified === 1` for a specific process. The EmissionService reads the recorded verdict *before* every mint (I8: the cause is already on-chain). If no verdict exists, or `verified ≠ 1`, the call throws and the ledger is unchanged.

*Because* I1 gives emission one cause, the guard is not "check a flag" — it is "confirm the cause exists." Removing the guard would not add a feature; it would create units with no cause, which the model cannot represent.

### Mint mechanics

- **Amount:** equal to the process amount `A` (1:1 — no multiplier, no discount). Forced by I2: the mint must be exactly mirrorable by a burn.
- **Bound to:** the `processId` of the confirmed process. A minted process part is never free supply; it names its cause.
- **Recorded in:** NodeChain as `emission.minted { processId, minted: A }` (I8).
- **Ledger effect:** `processMinted += A`.

There is no scheduled mint, no pre-allocation, no mint-on-deposit, and no free issuance — each would be a mint without the one allowed cause.

The **earned part** (commission) is credited by the same confirmed verdict as retained value: `node payment` to nodes (I3) and `reserve accrual` to AST's own reserve (I4). It is credited, never burned.

---

## 2. Burn — when and how

### Trigger

The process part is burned **immediately on cycle completion — within the same confirmed process that produced the mint.** The burn mirrors the mint so the process part nets to zero (`processMinted == processBurned` after each completed cycle).

*Because* I2 says the process part exists only while the process is in flight, completion is not an occasion to *decide* to burn — it is the cause that *necessitates* the burn.

### Burn mechanics

- **Amount:** equal to the amount minted for the same process (`emit` calls `burn(minted)`).
- **Recorded in:** NodeChain as `emission.burned { processId, burned: A }` (I8).
- **Ledger effect:** `processBurned += A`.

The earned part is **never** burned; burning payment would contradict I3 (payment must be retained). It lives in `earnedRetained`.

---

## 3. Supply identity (the fixed point of the two transitions)

```
totalSupply = (processMinted − processBurned) + earnedRetained
```

Because `processMinted == processBurned` after all cycles complete (I2), `totalSupply` converges to `earnedRetained`. **Therefore all lasting supply is confirmed, paid-for work (I3) and nothing else (I1).** The full mint/burn history is reproducible from NodeChain (I5, I8).

---

## 4. Guards (the closure conditions)

| Guard | Rule | Enforces |
|---|---|---|
| PoT gate | No mint without `verified === 1`; the call throws on an unauthorized attempt. | I1 |
| NodeChain record | Every mint and burn is appended to the append-only chain before acknowledgement. | I8 |
| Cycle symmetry | Burn amount equals mint amount for the same `processId`. | I2 |
| Append-only ledger | `processMinted` and `processBurned` are monotone non-decreasing. | I5, I8 |
| Payment retained | The earned part is credited, never burned. | I3 |
| Reserve internal | The reserve share accrues only to `SYSTEM_RESERVE` (AST's own). | I4 |

Each guard is the enforcement of one invariant. Together they make the transition set *closed*: there is no reachable state that violates I1–I4.

---

## 5. Canonical values

```
Emission (process part) = A                    (1:1)                 [I1,I2]
Commission (earned)     = A × 0.005            (0.5%)                [I3]
  Node payment          = Commission × 0.75    (→ nodes, PoT weight) [I3]
  Reserve accrual       = Commission × 0.25    (→ AST's own reserve) [I4]
Net supply Δ            = +Commission per completed cycle
                          (process part minted then burned → 0; earned part retained)
```

---

## 6. Failure codes (what a broken chain looks like, so it can be caught)

| Code | Condition | Invariant defended |
|---|---|---|
| `E_NO_VERDICT` | mint attempted with no recorded PoT verdict | I1 |
| `E_NOT_VERIFIED` | verdict exists but `verified ≠ 1` | I1 |
| `E_MINT_BURN_ASYM` | burn amount ≠ mint amount for the same process | I2 |
| `E_EARNED_BURNED` | an attempt to burn the earned part | I3 |
| `E_RESERVE_EXTERNAL` | reserve share routed outside `SYSTEM_RESERVE` | I4 |
| `E_REPLAY` | a recorded cause is applied a second time | I5, I8 |

Each code is defined so that the impossible states are *nameable and rejected*, not merely improbable.

---

## 7. Reference

- Specs: `docs/specs/AST_Emission_AGENT_EN.md`, `docs/specs/AST_ArosCoin_AGENT_EN.md`
- Reference implementation: `reference/ast-core/src/emission.ts`, `reference/ast-core/src/aroscoin.ts`
- NestJS services: `src/emission/emission.service.ts`, `src/aroscoin/aroscoin.service.ts`
