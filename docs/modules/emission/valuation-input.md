# Emission — Valuation Input

**Code:** `src/emission`  
**Canon:** §5.1–5.2, §6.5  

---

## Principle

AST **does not calculate** asset value.  
AST accepts only an **already confirmed institutional valuation** and uses it as the basis for minting and subsequent changes.

---

## ValuationInput entity

| Field (conceptual) | Meaning |
|--------------------|---------|
| `processId` | Binding process |
| valuation amount / official price | Institution-provided |
| currency / unit metadata | As attested |
| document package ref | Signature + docs verified upstream |
| institutional certificate | Authenticity context (P1) |
| asset class id | Cap and policy lookup |
| attestation refs | Qualified signatures |

Oracle gateway, when used, is **transport** for attested data — not an independent appraiser.

---

## Primary tokenization

Per canon §5.2:

1. Institution provides document package (official valuation + qualified digital signature).  
2. System verifies authenticity.  
3. PoT confirms the fact that a confirmed valuation was provided.  
4. NodeChain records token creation events.  
5. Primary minting occurs **strictly at the fixed institutional price**.

Emission planning for primary mint uses that fixed price / package — never an internal market estimate.

---

## Revaluation inputs

For post-primary changes:

| Input | Role |
|-------|------|
| Previous confirmed value | Baseline for ΔValue |
| New institutional valuation | Confirmed change package |
| ΔValue | Signed change used in §9.10 |
| Holder set snapshot | For I9 pro-rata |

ΔValue must itself be process-bound and PoT-gated; emission does not invent deltas from market feeds alone.

---

## Informational vs mint basis

| Metric | Mint basis? |
|--------|-------------|
| Institutional valuation | **Yes** |
| `ArosCoin_internalPrice = base × reserveIndex` (§9.3) | **No** — informational only |
| Market CEX price | **No** |
| Eye analytics | **No** |

---

## Validation before plan

| Check | Fail behavior |
|-------|---------------|
| Missing institutional attestation | Reject plan |
| PoT not verified | Reject |
| Asset class unknown | Reject |
| Cap would be exceeded | `EmissionCapped` / fail closed |
| Non-deterministic incomplete package | Reject |

---

## Selective custody note

Valuation input never implies AST holds the client’s underlying asset or third-party cash. Tokenization records rights; Selective Custody allows only AST **own** funds in reserve books.
