# AST Reserve — Accrual

**Stands on:** I1 (PoT-gated origin), I3 (payment for confirmed work), I4 (reserve is AST's own), I5 (determinism), I8 (append-only causality); and I‑RS‑3 (accrual is internal and confirmed-caused). See `README.md` §§1–2 and `01_coin_engine/README.md` §1.

## Purpose

Define how AST's own reserve is credited: the single cause of an accrual, the exact amount, the sole destination, and the record it leaves. There is exactly one way value enters the reserve — the `RESERVE_SHARE` of a commission on a PoT-confirmed process — and this document derives that closure from the invariants. Nothing else funds the reserve, because nothing else is a cause of it.

---

## 1. The one cause of an accrual

A reserve accrual is authorized **iff** a commission has been charged on a process whose PoT verdict is `verified === 1`. The commission itself has one cause (a confirmed process, I1/I3); the reserve share is one of its two branches (I4). Therefore the reserve share inherits that single cause exactly.

*Because* I1 gives commission one cause and I4 assigns 25% of it to AST's own reserve, an accrual is not a transfer someone *decides* to make — it is the causal effect of a confirmed process. Remove the confirmed process and there is no commission, hence no share, hence no accrual. There is no accrual on deposit, no scheduled accrual, no top-up, no grant, no external funding — each would be an accrual without the one allowed cause (I‑RS‑3).

---

## 2. The exact amount

For a confirmed process of amount `A`, at the rate `COMMISSION_RATE` in force for that process:

```
Commission        C          = A × COMMISSION_RATE          [I3]
  Node payment    = C × NODE_SHARE    = C × 0.75            [I3]  → nodes
  Reserve accrual = C × RESERVE_SHARE = C × 0.25            [I4]  → SYSTEM_RESERVE
```

The split is forced, not chosen: `NODE_SHARE + RESERVE_SHARE = 0.75 + 0.25 = 1`, so the whole commission is accounted for and none escapes. Routing any part of the 25% anywhere but `SYSTEM_RESERVE` breaks I4; changing the 0.25 outside its complement of `NODE_SHARE` breaks the identity that the commission splits exactly in two.

### Worked example — process amount 10,000 ARO

```
A               = 10,000 ARO
Commission      = 10,000 × 0.005 = 50 ARO                   [I3]
  Node payment  = 50 × 0.75 = 37.50 ARO   (→ nodes)         [I3]
  Reserve accr. = 50 × 0.25 = 12.50 ARO   (→ SYSTEM_RESERVE) [I4]
```

The reserve gains `12.50 ARO`, recorded as one `reserve.accrual` event. The process part (`10,000 ARO`) is minted and burned (I2) and never touches the reserve; only the earned, retained share does (I3).

---

## 3. The sole destination

Every accrual credits **`SYSTEM_RESERVE`** — AST's own internal reserve account — and nothing else.

*Because* I4 makes the reserve share AST's own and owed to no external party, `SYSTEM_RESERVE` is the only valid destination. An accrual addressed to any external account, or to any party's claim, is not a reserve accrual at all; it is an I4 violation and is vetoed before acknowledgement (I7). There is no per-party sub-ledger inside the reserve, because there is no party inside it: the reserve is one account, AST's own.

---

## 4. The record it leaves

Every accrual is appended to NodeChain **before** it is acknowledged (I8), as:

```
reserve.accrual {
  processId,            // the confirmed process that caused it (I1)
  epoch,                // settlement epoch, if batched (§5)
  commission: C,        // the commission this share came from (I3)
  reserveShare: 0.25,   // RESERVE_SHARE in force (I4)
  amount: C × 0.25,     // the credited value
  account: SYSTEM_RESERVE
}
```

The event names its own cause (`processId`) and its own arithmetic (`commission`, `reserveShare`, `amount`), so any auditor can recompute it and confirm it. The reserve balance is not a stored authority; it is the replayable sum of these events (I5):

```
reserveBalance = Σ reserve.accrual.amount  −  Σ reserve.release.amount
```

where releases are the maturity-gated outflows of `reserve_release.md`. Because both terms are append-only NodeChain events, the balance is reproducible on every node, every time (I5, I8).

---

## 5. Per-process and per-epoch accrual (same cause, same amount)

Per-process accounting is exact. Settlement may be **batched per epoch** (`POT_EPOCH_SECS = 600`) for efficiency — an operational choice, not an economic one. At epoch finalization the accumulated commission is settled with the identical canonical split:

- **75%** → node payment pool (`08_fee_distribution`, `payment_distribution.md`).
- **25%** → `SYSTEM_RESERVE`, recorded as `reserve.accrual` (aggregated over the epoch's confirmed processes).

Batching changes *when* the credit is written, never *how much* or *why*: the sum of per-epoch accruals equals the sum of the per-process accruals it aggregates (I5). Each confirmed process still contributes exactly `C × 0.25`, and each contribution still names a `verified === 1` verdict as its cause.

---

## 6. The accrual balance is recorded value, not an index input

The reserve balance answers *"how much has AST's own reserve accrued?"* It does **not** answer *"what is `reserveIndex`?"* — that is computed from confirmed **volume** alone (I‑RS‑1, `reserve_index.md`).

*Because* the same underlying process both (a) adds `A` to `totalProcessVolume` and (b) adds `C × 0.25` to the reserve balance, feeding the balance into the index would count that one process twice — once as volume, once as accrual — and the index would no longer be reproducible from canonical inputs (I5 fails). Therefore the accrual balance is strictly a **recorded value for audit**, and the index reads volume only. The two never cross (`README.md` §4).

---

## 7. Failure codes (a broken accrual chain, named so it can be caught)

| Code | Condition | Invariant defended |
|---|---|---|
| `E_ACCRUAL_NO_VERDICT` | accrual with no `verified === 1` verdict for its `processId` | I1, I‑RS‑3 |
| `E_ACCRUAL_EXTERNAL` | accrual credited to any account other than `SYSTEM_RESERVE` | I4 |
| `E_ACCRUAL_AMOUNT` | `amount ≠ commission × RESERVE_SHARE` | I3, I4 |
| `E_ACCRUAL_UNCONFIRMED_SOURCE` | accrual sourced from anything but a commission (deposit, grant, top-up) | I‑RS‑3 |
| `E_ACCRUAL_FED_INDEX` | the accrual balance used as an input to `reserveIndex` | I‑RS‑1, I5 |
| `E_ACCRUAL_REPLAY` | a recorded `reserve.accrual` applied a second time | I5, I8 |

Each code makes an impossible state *nameable and rejected*, not merely improbable.

---

## 8. Reference

- Canonical split: `01_coin_engine/coin_emission_model.md` (§ "Epoch-level settlement"), `01_coin_engine/burn_and_mint_rules.md` §5.
- Commission settlement: `src/commission/commission.service.ts` — `CommissionService.finalizeEpoch()`.
- Reserve account and balance: `src/reserve/reserve.service.ts` — `SYSTEM_RESERVE`, `reserveBalance()`.
- Index (volume-only, kept separate): `reserve_index.md`.
