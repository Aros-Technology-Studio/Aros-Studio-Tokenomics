**AROS Tokenomics — Reserve Layer**

**Path: AROS-PARADIGM-AST/15_reserve/README.md**

Canonical documentation for the AST Reserve — the layer that defines what AST's own reserve *is*, how it accrues, how it is summarized by `reserveIndex`, and how (and only how) value in it matures into wider circulation. This layer is described entirely on AST's own terms: NodeChain, PoT (Proof-of-Transaction), commission, the reserve share, `SYSTEM_RESERVE`, `reserveIndex`, and the All-Seeing Eye. It depends on no external system, funds no external obligation, and names none.

⸻

## 0) How to read this layer

Every rule in the Reserve layer is a **consequence**, not a preference. The layer stands on the eight engine invariants (`01_coin_engine/README.md` §1) and adds four reserve-specific ones (§2 below, `reserve_invariants.md`). Each document states which invariants it rests on and derives its mechanics by an explicit *because → therefore* chain. If a rule cannot be traced back to an invariant, it does not belong here. Start from any mechanic in this layer and you can walk the causal chain back to an axiom.

⸻

## 1) What the reserve is — and is not

**The reserve is AST's own capitalization (I4).** It is the accumulated `RESERVE_SHARE` (25%) of every commission charged on confirmed work. It accrues to `SYSTEM_RESERVE`, an internal account of AST itself. It belongs to no external party, represents no deposit by anyone, and funds no obligation owed outside AST.

Stated positively, the reserve is exactly three things:

1. **A recorded balance** — the running sum of `reserve.accrual` credits, each one caused by a confirmed process (`reserve_accrual.md`). It is retained value, the way node payment is retained value (I3): the causal effect of confirmed work.
2. **A capitalization signal** — summarized (never *funded*) by `reserveIndex = log10(1 + totalProcessVolume)`, a monotone function of confirmed process **volume** only (`reserve_index.md`, I‑RS‑1/4).
3. **A maturing source** — value that enters wider circulation only through a deterministic, Eye-vetoable maturity gate keyed on `reserveIndex`/velocity thresholds and recorded in NodeChain (`reserve_release.md`, I5/I7/I8).

Because the reserve is AST's own (I4) and ARO has no market price (I6), the reserve is **not** any of the following — and each is excluded because the model contains no object it could act on, not by prohibition:

| It is not | Why it has no object here | Invariant |
|---|---|---|
| A fund owed to an external party | the reserve is AST's own; no external claimant exists | I4 |
| A market price or a price it defends | ARO has no market price to quote or defend | I6 |
| A buyback pool | there is no speculative float to buy back | I6 |
| A liquidity pool | there is no external venue or pair to provide liquidity to | I6 |
| A yield/staking venue | no balance is deposited to earn; payment follows confirmed work only | I3, I6 |
| A price-floor / stabilizer | no price exists to floor or stabilize | I6 |
| A discretionary treasury | value moves only by deterministic, recorded, Eye-observed process | I5, I7, I8 |

⸻

## 2) Reserve invariants (the reserve-specific axioms)

These sit under I4 and are the first causes of everything in this layer. Full statements, proofs, and failure codes are in `reserve_invariants.md`.

- **I‑RS‑1 — Volume-derived.** `reserveIndex` is a function of confirmed process **volume** recorded in NodeChain, and of nothing else. No balance, no accrual total, no external quote is an input. *Because* feeding the accrual balance back in would count the same underlying transaction twice (once as volume, once as accrual) and break reproducibility (I5).
- **I‑RS‑2 — Never a free authority.** No role, committee, or account may *set* `reserveIndex` or move reserve value by decree. The index is computed; releases are gated by recorded thresholds. A settable index or a decreed movement would be a discretionary token movement, forbidden by I5.
- **I‑RS‑3 — Accrual is internal and confirmed-caused.** The reserve is credited only by the `RESERVE_SHARE` of a commission on a PoT-confirmed process, and only to `SYSTEM_RESERVE`. Nothing else may fund it. *Because* I1 gives commission one cause (a confirmed process) and I4 makes the share AST's own.
- **I‑RS‑4 — Monotone non-decreasing in volume.** `reserveIndex` never falls as a lever: `log10(1 + x)` is monotone in `x ≥ 0`, and `totalProcessVolume` only grows (volume is appended, never removed — I8). The index tracks accumulated confirmed work; it is not steered.

⸻

## 3) Canonical constants (cited, not redefined)

The engine constants (`01_coin_engine/README.md` §3) govern this layer; the reserve introduces no new economic constant, only threshold *parameters* for the maturity gate, which are bounded and role-set (§6).

| Constant | Value | Meaning |
|---|---|---|
| `RESERVE_SHARE` | `0.25` | Fraction of every commission accrued to AST's own reserve (I4). |
| `NODE_SHARE` | `0.75` | The complementary fraction paid to nodes for confirmed work (I3). |
| `COMMISSION_RATE` | `0.005` (bounds `[0, 0.01]`) | Share of the process amount charged as the earned part. |
| `POT_EPOCH_SECS` | `600` | Reference epoch length for batched accrual settlement (operational, not economic). |
| `SYSTEM_RESERVE` | account id | AST's own reserve account; sole destination of `reserve.accrual`. |

There is no reserve target, no reserve cap, and no reserve floor — because I6 leaves no object for a cap or a floor, and I‑RS‑4 makes the index a tracked consequence, not a managed level.

⸻

## 4) The reserve's place in the one cycle

The reserve is one link in the single causal chain of the whole system (`01_coin_engine/README.md` §4). This layer expands that one link — the `RESERVE_SHARE` branch — and the maturity gate that later draws on it.

```
confirmed work (PoT verdict verified===1, process P, amount A)          [cause — I1]
      │
      ├─▶ MINT process part = A                                         [I1]  recorded [I8]
      │
      ├─▶ CHARGE commission C = A × COMMISSION_RATE                     [I3]
      │        ├─▶ node payment    = C × NODE_SHARE    → nodes          [I3]
      │        └─▶ reserve accrual = C × RESERVE_SHARE → SYSTEM_RESERVE [I4]  recorded as reserve.accrual [I8]
      │
      ├─▶ totalProcessVolume += A   (volume, NOT the accrual)           [I‑RS‑1]  recorded [I8]
      │        └─▶ reserveIndex = log10(1 + totalProcessVolume)         [I‑RS‑1/4]  (computed, never set — I‑RS‑2)
      │
      └─▶ on cycle completion: BURN process part = A                    [I2]  recorded [I8]

later, independently of any single cycle:
      maturity gate: if reserveIndex/velocity thresholds are met       [I5]
             └─▶ deterministic reserve.release → wider circulation      recorded [I8], Eye-vetoable [I7]
```

Two flows meet the reserve and never cross: **volume** drives the index (I‑RS‑1), **accrual** builds the balance (I‑RS‑3). Keeping them separate is what stops the double-count that would break I5 (`reserve_index.md` §III).

⸻

## 5) Directory layout (skeleton)

```
15_reserve/
├── README.md                # This file — reserve invariant spine, what the reserve is/is not, place in the cycle
├── reserve_accrual.md       # How the 25% share accrues per confirmed process/epoch, recorded as reserve.accrual
├── reserve_index.md         # reserveIndex: volume-only, logarithmic, monotone; internalPrice as process-bound valuation
├── reserve_release.md       # The maturity gate: deterministic maturation into circulation; no buyback/liquidity/floor
└── reserve_invariants.md    # I‑RS‑1..4 restated with proofs, failure codes, and audit tests over NodeChain
```

⸻

## 6) Governance of the maturity gate (bounded, role-based)

The maturity gate reads threshold *parameters* (e.g. a `reserveIndex` step and a velocity window; `reserve_release.md` §III). These are not free:

- They move only **within protocol-defined bounds**, so no setting can force a release that violates an invariant (a threshold of zero would make maturation unconditional, contradicting the gate's whole purpose under I5).
- A change is a **role-based** decision of the oversight committee, observed by the Eye. It is **not** decided by ARO holdings — I6 leaves no governance-by-holding, so a held balance confers no vote.
- Every change is recorded in NodeChain before it takes effect (I8), so the thresholds in force for any release are reproducible (I5).
- No role may set `reserveIndex` or move reserve value directly (I‑RS‑2); a committee may only adjust bounded gate parameters, never the balance or the index.

⸻

## 7) Oversight and halting

- **Eye veto (I7):** the Eye observes every `reserve.accrual` and every `reserve.release`. It can **veto** (halt) any release that would violate I1–I6 or I‑RS‑1..4 — for example, a release computed from a stale index, or an accrual routed outside `SYSTEM_RESERVE`. The Eye never *initiates* an accrual or a release; its power is strictly negative.
- **Deterministic replay (I5):** the reserve balance and every release are reproducible by replaying `reserve.accrual` and `reserve.release` events from NodeChain. There is no off-chain reserve state.
- **Append-only cause (I8):** an accrual credit is acknowledged only after its causing `verified === 1` verdict is on-chain; a release is acknowledged only after its causing threshold-satisfaction record is on-chain.

⸻

## 8) What auditing checks (invariants restated as tests)

Auditing here is the restatement of the reserve invariants as tests over the NodeChain record (full list in `reserve_invariants.md` §5):

- **Accrual causality (I‑RS‑3):** every `reserve.accrual` is preceded by a `verified === 1` verdict for the same process, credited to `SYSTEM_RESERVE`, at exactly `C × RESERVE_SHARE`.
- **Index purity (I‑RS‑1):** `reserveIndex` recomputed from `totalProcessVolume` alone equals the recorded value; no accrual or external quote moved it.
- **Monotonicity (I‑RS‑4):** across the chain, `reserveIndex` is non-decreasing.
- **No decree (I‑RS‑2):** no NodeChain event sets the index or moves reserve value without a computed, threshold-gated cause.
- **Release determinism (I5, I7, I8):** every `reserve.release` is reproducible from its recorded threshold inputs and carries no Eye-authored mint/burn/payment.
