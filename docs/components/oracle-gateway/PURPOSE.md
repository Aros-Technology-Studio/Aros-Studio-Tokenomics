# PURPOSE — `oracle-gateway`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` orchestrator path; P2 pipeline step 3; P4.16  
**Code path:** `src/oracle-gateway/`  
**Clarifications:** P4.16 oracle_gateway real; multi-oracle + signatures; fail-closed

---

## Why this exists

Optional **orchestrator pipeline step** that admits **external attested inputs** (multi-oracle, signature-verified) when a process needs transport data beyond the direct institutional package. AST does **not** invent institutional valuation here — transport and verification only.

---

## Responsibility

- Owns: attestation intake, multi-oracle quorum count, signature verification, accept/reject result, NodeChain record of acceptance, fail-closed signal to orchestrator.
- Contributes to: process evidence before PoT when oracle step is required.
- Does **not** own: self-appraisal / price invention, PoT verdict, mint/burn, Eye veto.

---

## Boundary (must not)

- Must not invent valuation numbers as AST.  
- Must not skip oracle when process type requires it (v1: no skip-oracle).  
- Must not soft-pass on failed signatures.  
- Must not mint or change reserve.  

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Multi-oracle + signature verification | Single unauthenticated feed as sole trust |
| Distinct oracleIds counted once | Double-count same oracle |
| Configurable requiredCount (default ≥ 2 when step used) | Always-1 with no config |
| NodeChain append on accept | Silent accept without ledger |
| Fail-closed → process expired path | Continue pipeline on fail |
| Transport institutional / market data only | AST self-appraisal |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `orchestrator` | optional step 3; fail-closed expires process |
| `nodechain` | acceptance record |
| `pot` | later confirmation; oracle is not PoT |
| `emission` | never called from gateway |
| `all-seeing-eye` | observes fail/accept events |
