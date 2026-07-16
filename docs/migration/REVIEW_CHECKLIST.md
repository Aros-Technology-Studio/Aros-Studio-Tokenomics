# Migration document review checklist (human)

**One form per candidate document (or tight pack).**  
Fill after `npm run check:migration` is green (or document is REWRITE-only).

| Field | Value |
|-------|--------|
| Document path (inbox) | |
| Source repo / commit | |
| Reviewer | |
| Date (UTC) | |
| Automated gate result | PASS / FAIL / N/A |
| Report file | `migration/reports/…` |

---

## A. Identity

- [ ] Target language in this repo: **English**  
- [ ] Destination: component pack | process | architecture | **DROP** | **AMEND CANON**  
- [ ] Does not replace `CANON.md` unless formal amendment  

---

## B. Hard prohibitions (CANON §X) — not as live features

- [ ] No system self-appraisal of assets  
- [ ] No mint without confirmed process / no unprocess-bound emission path  
- [ ] No passive yield surfaces without executed work  
- [ ] No holding third-party participant funds  
- [ ] No All-Seeing Eye veto or rollback powers  
- [ ] No bypass of NodeChain or PoT  
- [ ] No speculative holding as product goal  

---

## C. Core architecture (CANON §§III–IV, XI)

- [ ] Value only with PoT `verified = 1` (I1)  
- [ ] Emission/burn bound to confirmed process (I2)  
- [ ] Significant events on NodeChain (I3)  
- [ ] Determinism from recorded inputs (I4)  
- [ ] NodeChain sole SoT; no block-chain metaphor for NodeChain API  
- [ ] Eye observe/notify only  
- [ ] Selective custody: own funds only (I6)  
- [ ] Pre–Release Phase: internal circulation only (I8)  
- [ ] Pro-rata new emission where applicable (I9)  

---

## D. Token and economics

- [ ] AST Token Protocol; external standards as adapters only  
- [ ] Institutional valuation + ΔValue model  
- [ ] Commission post-factum; payment vocabulary compliant with gates  
- [ ] Aligns with P0–P4 or marks **proposed** vs **canon**  

---

## E. Conflict log

| Claim in candidate | Canon / P0–P4 | Resolution |
|--------------------|---------------|------------|
| | | |

---

## F. Decision

| Outcome | Tick |
|---------|------|
| **PROMOTE** (after rewrite into target shape) | [ ] |
| **REWRITE** (ideas only) | [ ] |
| **DROP** | [ ] |
| **AMEND CANON** (owner only) | [ ] |

Notes:

Sign-off: _______________
