# AST Reserve — Invariants (I‑RS‑1..4)

**Stands on:** I1, I2, I3, I4, I5, I6, I7, I8 (`01_coin_engine/README.md` §1). This document states the four reserve-specific invariants that sit under I4, proves each from the engine axioms, gives its failure codes, and restates it as an audit test over NodeChain. Every mechanic in `reserve_accrual.md`, `reserve_index.md`, and `reserve_release.md` is a consequence of one of these.

---

## Preface — where the reserve invariants come from

I4 (*"the reserve is AST's own"*) fixes **whose** the reserve is and **how it is valued in principle**: its share accrues to AST alone, its capitalization index is derived from confirmed process volume, is monotone in that volume, and is never a free authority. I‑RS‑1..4 are the operational reading of that clause — the four properties that make I4 enforceable over the ledger. They add nothing to the axiom set; they *unfold* I4 (with I5, I6, I8) into checkable statements.

---

## I‑RS‑1 — Volume-derived

**Statement.** `reserveIndex` is a function of confirmed process **volume** recorded in NodeChain (`totalProcessVolume`), and of nothing else. No reserve balance, no accrual total, and no external quote is an input.

**Proof (from I5, I4, I6).**
Suppose the index read some input beyond confirmed volume.
- If that input were the **reserve balance**: the same confirmed process contributes both `A` to volume and `C × 0.25` to the balance (`reserve_accrual.md` §6). The index would then depend on that process twice. An auditor recomputing the index from canonical inputs would either double-count or be unable to reproduce the recorded value — contradicting I5 (reproducibility from canonical inputs).
- If that input were an **external quote**: I6 leaves ARO with no market price, so no such quote exists in the model; reading one would import a referent the model excludes.

Both cases contradict an axiom. **Therefore** the only admissible input is confirmed volume. ∎

**Failure codes.** `E_INDEX_NONVOLUME_INPUT`, `E_ACCRUAL_FED_INDEX`, `E_INDEX_EXTERNAL_QUOTE`.

**Audit test.** For the recorded `reserveIndex` at any height, recompute `log10(1 + Σ emission.minted)` over confirmed processes up to that height; assert equality. Assert no `reserve.accrual.amount` and no external value appears in the index computation.

---

## I‑RS‑2 — Never a free authority

**Statement.** No role, committee, or account may *set* `reserveIndex` or move reserve value by decree. The index is computed; reserve value moves only through the deterministic maturity gate.

**Proof (from I5, I‑RS‑1).**
A settable index or a decreed transfer of reserve value would be a token-state movement whose cause is a discretionary act, not a canonical recorded input. I5 requires every movement to be reproducible from canonical inputs recorded in NodeChain. A decree is not such an input — replaying the ledger without the decree would not reproduce it. **Therefore** neither the index nor a reserve movement may originate from decree; the index is computed from volume (I‑RS‑1) and value moves only by the gate function of recorded state (`reserve_release.md`). ∎

**Corollary (governance bound).** The oversight committee may adjust only **bounded gate parameters**, recorded before effect (I8). It may never write the index or name a release amount (`README.md` §6).

**Failure codes.** `E_INDEX_SET`, `E_RELEASE_DISCRETIONARY`, `E_RELEASE_NO_GATE`.

**Audit test.** Assert no NodeChain event writes `reserveIndex` directly. Assert every `reserve.release.amount` equals the gate function recomputed from the release's recorded inputs (`reserveIndexAt`, `velocityAt`, `thresholds`, `reserveBalance`).

---

## I‑RS‑3 — Accrual is internal and confirmed-caused

**Statement.** The reserve is credited **only** by the `RESERVE_SHARE` (0.25) of a commission on a PoT-confirmed process, and **only** to `SYSTEM_RESERVE`. Nothing else funds it.

**Proof (from I1, I3, I4).**
By I1, a commission exists only as a consequence of a process with `verified === 1`. By I4, 25% of every commission accrues to AST's own reserve; by I3 it is retained value, not a payout someone elects. There is no other cause of a commission (I1), hence no other source of a reserve share; and I4 names AST's own reserve (`SYSTEM_RESERVE`) as the party, so no external account is a valid destination. **Therefore** every accrual is confirmed-caused, exactly `C × 0.25`, credited to `SYSTEM_RESERVE`, and no deposit, grant, schedule, or external transfer can fund the reserve. ∎

**Failure codes.** `E_ACCRUAL_NO_VERDICT`, `E_ACCRUAL_EXTERNAL`, `E_ACCRUAL_AMOUNT`, `E_ACCRUAL_UNCONFIRMED_SOURCE`.

**Audit test.** For every `reserve.accrual`: assert a `verified === 1` verdict exists for its `processId`; assert `account == SYSTEM_RESERVE`; assert `amount == commission × RESERVE_SHARE`. Assert no credit to `SYSTEM_RESERVE` exists without a `reserve.accrual` cause.

---

## I‑RS‑4 — Monotone non-decreasing in volume

**Statement.** `reserveIndex` never falls as a lever: for states at heights `t₂ ≥ t₁`, `reserveIndex(t₂) ≥ reserveIndex(t₁)`.

**Proof (from I8 and the formula).**
`log10(1 + x)` is strictly increasing for `x ≥ 0` (derivative `1 / ((1 + x) ln 10) > 0`). `totalProcessVolume` is a sum of `emission.minted` amounts appended to NodeChain and never removed (I8: append-only; volume is a record of the past). Hence `totalProcessVolume(t₂) ≥ totalProcessVolume(t₁)`, and applying the increasing function preserves the order. There is no operation that lowers `totalProcessVolume` and no writable index to lower (I‑RS‑2). **Therefore** the index is monotone non-decreasing, and any recorded decrease is a violation, not a valid state. ∎

**Failure codes.** `E_INDEX_DECREASED`, `E_INDEX_VOLUME_REMOVED`.

**Audit test.** Walk `reserveIndex` across successive NodeChain heights; assert it is non-decreasing. Independently assert `totalProcessVolume` is non-decreasing (no volume un-appended).

---

## Cross-cutting audit (the reserve invariants as one suite)

Auditing the reserve is the restatement of I‑RS‑1..4 (under I4–I8) as tests over the append-only record. All are pure functions of NodeChain — no off-chain reserve state exists (I5).

| # | Test | Restates |
|---|---|---|
| 1 | `reserveIndex == log10(1 + Σ confirmed emission.minted)`; no accrual/quote input | I‑RS‑1 |
| 2 | no direct index write; every release amount recomputes from its recorded gate inputs | I‑RS‑2 |
| 3 | every accrual is verdict-caused, `= C × 0.25`, to `SYSTEM_RESERVE`; nothing else funds the reserve | I‑RS‑3 |
| 4 | `reserveIndex` and `totalProcessVolume` are non-decreasing across the chain | I‑RS‑4 |
| 5 | `reserveBalance == Σ reserve.accrual − Σ reserve.release`, reproducible by replay | I5, I8 |
| 6 | every `reserve.release` is Eye-observed and appended before effect; no Eye-authored mint/burn/payment | I7, I8 |
| 7 | accrual balance never appears as an index input (no double-count) | I‑RS‑1, I5 |

Each test names an impossible state and rejects it, so the reserve's closure is *verified*, not assumed: start from any reserve event and its cause is on-chain, its amount recomputes, and its effect is reproducible.

---

## Full failure-code index (this layer)

| Code | Condition | Invariant |
|---|---|---|
| `E_ACCRUAL_NO_VERDICT` | accrual without a `verified === 1` verdict for its process | I1, I‑RS‑3 |
| `E_ACCRUAL_EXTERNAL` | accrual to any account but `SYSTEM_RESERVE` | I4, I‑RS‑3 |
| `E_ACCRUAL_AMOUNT` | `amount ≠ commission × RESERVE_SHARE` | I3, I‑RS‑3 |
| `E_ACCRUAL_UNCONFIRMED_SOURCE` | reserve funded by anything but a commission | I‑RS‑3 |
| `E_ACCRUAL_FED_INDEX` | accrual balance used as an index input | I‑RS‑1, I5 |
| `E_ACCRUAL_REPLAY` | a `reserve.accrual` applied twice | I5, I8 |
| `E_INDEX_NONVOLUME_INPUT` | index input other than `totalProcessVolume` | I‑RS‑1, I5 |
| `E_INDEX_SET` | direct write/override of `reserveIndex` | I‑RS‑2 |
| `E_INDEX_DECREASED` | recorded index fell between two states | I‑RS‑4, I8 |
| `E_INDEX_VOLUME_REMOVED` | `totalProcessVolume` decreased | I8, I‑RS‑4 |
| `E_INDEX_EXTERNAL_QUOTE` | external/market number fed the index | I6, I‑RS‑1 |
| `E_RELEASE_NO_GATE` | release with no recorded threshold-satisfaction cause | I5, I‑RS‑2 |
| `E_RELEASE_DISCRETIONARY` | release amount named by a role, not computed | I‑RS‑2 |
| `E_RELEASE_STALE_INDEX` | `reserveIndexAt` ≠ index recomputed from volume | I‑RS‑1, I‑RS‑4 |
| `E_RELEASE_OVER_BALANCE` | `amount > reserveBalance` | I‑RS‑3 |
| `E_RELEASE_EXTERNAL_VENUE` | release framed as buyback / liquidity / price support | I6 |
| `E_RELEASE_UNVETOABLE` | release acknowledged before the Eye could observe | I7, I8 |
| `E_RELEASE_REPLAY` | a `reserve.release` applied twice | I5, I8 |

---

## Reference

- Spine and constants: `README.md`.
- Accrual: `reserve_accrual.md`. Index: `reserve_index.md`. Release: `reserve_release.md`.
- Engine axioms: `01_coin_engine/README.md` §1.
