# emission_layer_overview.md

## Module: Fee / Commission Layer Overview

- **Layer**: Fee / Commission Layer — AST (Aros Studio Tokenomics)
- **Stands on**: I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment for confirmed work), I4 (reserve is AST's own), I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality)

---

## Overview

The Fee / Commission Layer governs the origin of ArosCoin (ARO) and the commission that confirmed work produces. Every unit that comes into existence in this layer does so as the **consequence** of a Proof-of-Transaction (PoT) verdict `verified === 1` for one specific process (I1). The layer neither schedules nor decides emission; it records the emission that a confirmed process has already caused, and it proves that record reproducible from NodeChain (I5, I8).

Under Commission Variant A, commission is charged and paid **in ArosCoin**, and the earned part is retained by its earner (I3). There is no external unit, no conversion, and no settlement leg outside ARO.

Every minted process part is therefore:

- **Caused by confirmed work** — bound to the `processId` of a `verified === 1` verdict (I1);
- **Born and burned** — minted at the open of a cycle and burned atomically at its close, netting to zero (I2);
- **Reproducible** — reconstructable on any node from the causes recorded in NodeChain (I5, I8);
- **Reversible only by veto or born-and-burned symmetry** — never by discretionary reissue (I7, I2).

---

## Strategic role in AST

| Function | Description | Derived from |
|---|---|---|
| Cause-driven issuance | No unit exists without a `verified === 1` verdict for a specific process. | I1 |
| Supply that cannot outrun work | The process part is minted then burned per cycle; lasting supply is only retained commission. | I2, I3 |
| Deterministic settlement | Every movement follows from recorded causes, identically on every node. | I5, I8 |
| Full traceability | Every unit links back to the verdict that caused it. | I1, I8 |
| Negative-only oversight | The Eye halts a bad step; it never creates one. | I7 |

---

## Core components

The layer coordinates the following, each of which acts only on a recorded cause:

- **PoT verdict reader** — reads the recorded `verified === 1` verdict that is the sole cause of a mint (I1). It confirms a cause; it does not manufacture one.
- **Emission executor** — mints the process part `= A` bound to the process, and charges commission `C = A × COMMISSION_RATE` in ARO (I1, I3).
- **Commission splitter** — divides `C` into `SYSTEM_NODE_POOL` (75%, I3) and `SYSTEM_RESERVE` (25%, I4). There is no third destination.
- **Cycle-close burner** — burns the process part `= A` at cycle close so the process part nets to zero (I2).
- **NodeChain writer** — appends every cause before its effect is acknowledged (I8).
- **All-Seeing Eye** — observes every step and vetoes any that would violate I1–I6 (I7).

---

## Control principles (each is a consequence, not a policy)

| Principle | Enforced behavior | Derived from |
|---|---|---|
| One verdict → one process part | A verdict causes exactly one mint of `A`, bound to its `processId`; a replayed cause produces no second effect. | I1, I5, I8 |
| Born and burned | The process part is burned at the close of the same cycle; `processMinted == processBurned`. | I2 |
| Commission in ARO, retained | Commission is charged in ARO and the earned part is retained, never converted or clawed back. | I3 |
| Two shares only | Commission splits 75/25 into node pool and AST's own reserve; there is no governance, ecosystem, or buffer share. | I3, I4 |
| No supply ceiling | Supply is the exact consequence of confirmed work, so there is no free quantity for a cap to bound. | I1, I6 |

---

## Why there is no emission ceiling, treasury share, or risk buffer

These are named here so their absence is understood as structural, not omitted. A **supply ceiling** would presuppose that emission is a free quantity the system chooses and must bound; but emission is exactly the consequence of confirmed work (I1) and the process part nets to zero (I2), so lasting supply already equals paid-for work (I3) — a ceiling would either never bind or would refuse to pay for confirmed work, contradicting I3. A **treasury / ecosystem / risk-buffer share** would be a third destination for commission with no confirmed-work cause and no invariant behind it; the only causes confirmed work produces are payment owed to the workers (I3) and accrual to AST's own reserve (I4), which is why the split is 75/25 and nothing else.

---

## Dependencies

- `01_coin_engine/README.md` — the invariant spine and canonical constants
- `01_coin_engine/burn_and_mint_rules.md` — the two supply transitions and their guards
- `emission_trigger_conditions.md` — the one trigger and its guards
- `epoch_allocation_model.md` — epoch settlement (batching, never capping)

---

## Next

→ See [`emission_trigger_conditions.md`](./emission_trigger_conditions.md) for the single condition that causes emission and the guards that defend it.
