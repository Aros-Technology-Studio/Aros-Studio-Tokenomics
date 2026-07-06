# AST Reserve — Capitalization Index

**Stands on:** I4 (reserve is AST's own), I5 (determinism), I6 (no speculative surface), I8 (append-only causality); and I‑RS‑1 (volume-derived), I‑RS‑2 (never a free authority), I‑RS‑4 (monotone in volume). See `README.md` §§1–2.

## Purpose

Define `reserveIndex`, the single capitalization signal of AST's own reserve: its formula, why its only input is confirmed process **volume**, why it is logarithmic, why it can only rise as a consequence, and why it is **not** a market price. Every property below is forced by an invariant; none is a modelling preference.

---

## 1. The formula

```
reserveIndex   = log10(1 + totalProcessVolume)          [I4, I‑RS‑1, I‑RS‑4]
internalPrice  = base × reserveIndex                    (a process-bound valuation, not a quote)
```

where `totalProcessVolume` is the running sum of confirmed process amounts — the `emission.minted` amounts recorded in NodeChain (I8) — and `base` is a fixed scale constant, not a market input.

The index is **computed on read**, never stored as an authority: given the recorded `totalProcessVolume`, any node derives the same `reserveIndex` (I5). There is no writable `reserveIndex` field that a role could set (I‑RS‑2).

---

## 2. Why the input is confirmed **volume** only (I‑RS‑1)

`totalProcessVolume` is confirmed work and nothing else: it is the sum over processes with `verified === 1` of their minted amount `A`. Trace what is *excluded* and why:

- **The reserve balance is excluded.** *Because* the same process that adds `A` to volume also adds `C × 0.25` to the reserve balance (`reserve_accrual.md` §6). If the balance also fed the index, that one process would be counted twice — once as volume, once as accrual — and the index would no longer be reproducible from canonical inputs, breaking I5. Therefore volume in, accrual out.
- **No external quote is admitted.** *Because* I6 leaves ARO with no market price, there is no quote to read; an external number would introduce a referent the model is defined to exclude.
- **No held-supply or float figure is admitted.** *Because* process parts are born and burned (I2) and never accumulate into a float, there is no speculative-supply quantity to feed in (I6).

**Therefore** the index reads exactly one quantity — confirmed volume — and that quantity has exactly one cause, confirmed work (I1). The index is a summary of *how much confirmed work the network has processed*, computed from the ledger of that work.

---

## 3. Why logarithmic

`log10(1 + x)` is chosen because it is the unique shape that keeps the index an honest **summary** rather than a speculation surface:

- **Anchored at zero.** At `totalProcessVolume = 0`, `log10(1 + 0) = 0`. The index starts at nothing, mirroring I1: with no confirmed work there is no capitalization to report.
- **Defined and smooth for all `x ≥ 0`.** `1 + x ≥ 1`, so the logarithm is always real and finite; there is no discontinuity or blow-up a manipulator could target.
- **Meaningful at scale without runaway.** As volume grows across orders of magnitude, the index grows steadily rather than explosively. A raw or exponential summary would let a large volume spike dominate; the logarithm compresses scale so the signal stays a proportionate reading of accumulated work.

The logarithm carries no policy. It does not *steer* value; it *reports* the magnitude of confirmed activity on a stable scale.

---

## 4. Why it can only rise (I‑RS‑4)

`reserveIndex` is monotonically non-decreasing, and this is a theorem, not a rule someone enforces:

1. `log10(1 + x)` is strictly increasing in `x ≥ 0` (its derivative `1 / ((1 + x) ln 10) > 0`).
2. `totalProcessVolume` only grows: it is a sum of `emission.minted` amounts appended to NodeChain and never removed (I8). Confirmed volume is a record of the past; the past does not shrink.

**Therefore** `reserveIndex(t₂) ≥ reserveIndex(t₁)` for `t₂ ≥ t₁`. The index cannot be pulled down as a lever, because there is no operation that lowers `totalProcessVolume` and no writable index to lower (I‑RS‑2). It rises only as more confirmed work accumulates — never faster, never on command.

---

## 5. Why it is not a market price (I6)

`internalPrice = base × reserveIndex` is a **process-bound valuation**, and the distinction from a market price is structural:

| Property | Market price | `internalPrice` here |
|---|---|---|
| Source | bids and asks of holders | `base × log10(1 + confirmed volume)` |
| Who sets it | a crowd, continuously | no one — it is computed (I‑RS‑2) |
| Can it fall on sentiment? | yes | no — monotone in recorded volume (I‑RS‑4) |
| Referent | what someone will pay | how much confirmed work occurred (I‑RS‑1) |
| Defended by the system? | often (floors, buybacks) | never — there is nothing to defend (I6) |

Because ARO has no market price (I6), `internalPrice` quotes nothing external and defends nothing. It is a reading of confirmed work expressed on a scale, valid on every node by replay (I5). Calling it a "price" is shorthand for a valuation *bound to process volume*, not a claim about any market.

---

## 6. The accrual balance vs. the index (kept apart on purpose)

Two quantities meet the reserve and must never be confused:

- **`reserveBalance`** = Σ `reserve.accrual` − Σ `reserve.release`. It answers *"how much has AST's own reserve accrued and retained?"* It is recorded value for audit (`reserve_accrual.md`).
- **`reserveIndex`** = `log10(1 + totalProcessVolume)`. It answers *"how much confirmed work backs the capitalization signal?"* It reads volume only.

Feeding one into the other is the single most tempting error, and it is forbidden by I‑RS‑1 because it double-counts the same process and breaks I5 (§2). The maturity gate (`reserve_release.md`) reads the **index** to decide *whether* value may mature, and the **balance** to know *how much* is available — but it never adds the balance to the index.

---

## 7. Worked reading

```
totalProcessVolume = 0            → reserveIndex = log10(1)          = 0.000
totalProcessVolume = 9            → reserveIndex = log10(10)         = 1.000
totalProcessVolume = 99           → reserveIndex = log10(100)        = 2.000
totalProcessVolume = 999,999      → reserveIndex = log10(1,000,000)  = 6.000
```

Each step of the index costs an order of magnitude more confirmed work than the last — the logarithm's honesty at scale. The index never moved because of a balance, a quote, or a decree; only accumulated confirmed volume moved it (I‑RS‑1/4).

---

## 8. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_INDEX_NONVOLUME_INPUT` | any input to `reserveIndex` other than `totalProcessVolume` | I‑RS‑1, I5 |
| `E_INDEX_SET` | an attempt to write/override `reserveIndex` directly | I‑RS‑2 |
| `E_INDEX_DECREASED` | recorded `reserveIndex` fell between two states | I‑RS‑4, I8 |
| `E_INDEX_VOLUME_REMOVED` | `totalProcessVolume` decreased (volume un-appended) | I8, I‑RS‑4 |
| `E_INDEX_EXTERNAL_QUOTE` | an external/market number fed the index or `base` | I6, I‑RS‑1 |

---

## 9. Reference

- Formula and rationale: `01_coin_engine/coin_emission_model.md` (§ "Capitalization index and internal valuation").
- Volume-only guarantee: `src/reserve/reserve.service.ts` — `ReserveService.reserveIndex()`.
- Kept-separate accrual balance: `reserve_accrual.md` §6.
- Gate that reads the index: `reserve_release.md`.
