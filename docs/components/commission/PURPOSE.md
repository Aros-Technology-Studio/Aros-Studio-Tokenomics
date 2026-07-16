# PURPOSE — `commission`

**Status:** ready  
**Canon refs:** `CANON.md` §III.2, §4.4, §9.4–9.5, §XI I5 I6  
**Code path:** `src/commission/` (maps to `settlement_controller`)  
**Clarifications:** P1.8 canonical v1

---

## Why this exists

Post-factum **settlement**: fee on confirmed valuation, full (simple) distribution engine — pay nodes in ARO and accrue AST’s own reserve share. All paths visible on NodeChain.

---

## Responsibility

- Owns: multi-schedule fees per asset class, valuation-based fee base, configurable node/AST split (default 70/30), take-on-PoT timing, ARO currency, redistribute + reserve accrue, waivers/tiers, NodeChain visibility, simple full distribution engine.
- Contributes to: lasting ARO movement for confirmed work (payment, not speculation).
- Does **not** own: PoT, staking, Eye powers.

---

## Boundary (must not)

- Must not pay before PoT confirmation.  
- Must not use vocabulary-gate banned tokens in APIs or product code.  
- Must not hide settlement off NodeChain.  
- Must not frame commission as speculative yield.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Multiple fee schedules per asset class | Single hard-coded rate only |
| Fee base = institutional valuation | Opaque off-ledger fee |
| Split configurable; default **70% nodes / 30% AST reserve** | Hidden ad-hoc splits |
| Taken **on PoT** after confirmation | Pre-work payment |
| Currency **ARO** | Untracked invoice as sole v1 path |
| Redistribute to nodes + accrue AST reserve | Hold client funds |
| Waivers/tiers configurable | — |
| Full path on NodeChain | Invisible settlement |
| API: `settleCommission`, `distributeNodePayment` | yield-style or banned-token API names |
| Full simple distribution engine in v1 | Rate-record-only stub as final |

### Vocabulary resolution

Owner intent: settlement + node distribution APIs. **Repo rule wins** (vocabulary gate + Core Canon post-factum **payment** language): ship only **`settleCommission`** and **`distributeNodePayment`**. Do not ship banned-token identifiers.

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `pot` | trigger after verified |
| `nodes` | payees / weights |
| `reserve` | AST share accrual (own funds) |
| `aroscoin` | ARO movements |
| `nodechain` | mandatory visibility |
