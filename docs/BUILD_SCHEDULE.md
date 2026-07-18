# AST Build Schedule

**Version:** 2.0  
**Status:** Canonical — rebuild after clean slate (`f0ee2c8`)  
**Source of Truth:** `docs/AST-CORE-CANON.md` + `docs/P0-P4-TECHNICAL-DECISIONS.md`

---

## 1. Purpose

Order of work for AST. **Docs first**, then core. No freelanced code. No fake Done.

**Portal:** owner re-opened as **edge scaffold** only (`portal/`, `docs/portal/`). Not Core SoT; no mint from portal.

---

## 2. Build Phases Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation (docs tree by layers/modules) | **Not started** |
| 1 | Core Ledger & Validation | **Not started** |
| 2 | Token & Emission | **Not started** |
| 3 | Orchestration (core only) | **Not started** |
| 4 | Governance & Release | **Not started** |
| 5 | Hardening | **Not started** |

Prior “Complete” checklists referred to removed scaffold and are **void**.

---

## 3. Phase checklist

### Phase 0 — Foundation
- [ ] Layer + module documentation tree (real specs, visible in repo)
- [ ] Acceptance criteria per layer
- [ ] Architecture map from Core Canon only
- [ ] Protective rules only when code exists

### Phase 1 — Core Ledger & Validation
- [ ] NodeChain
- [ ] PoT engine (P1–P4, M-of-N)
- [ ] PoT → NodeChain write-ahead
- [ ] Invariants I1–I9

### Phase 2 — Token & Emission
- [ ] ArosCoin mint/burn (protocol)
- [ ] Emission / ΔValue
- [ ] Commission post-factum (ship default 70/30)
- [ ] Reserve (own funds only)

### Phase 3 — Orchestration (core only)
- [ ] Fixed pipeline orchestrator
- [ ] State recording into NodeChain
- [ ] Idempotency / fail-closed
- [x] Institutional Portal edge scaffold (`portal/`) — OpenAPI + Nest + Next.js

### Phase 4 — Governance & Release
- [ ] All-Seeing Eye (observe/notify only)
- [ ] Node reputation
- [ ] Release phase logic
- [ ] Oracle gateway (if in scope for core)

### Phase 5 — Hardening
- [ ] Tests against specs
- [ ] Kill-switch
- [ ] External audit / prod (later, owner-driven)

---

## 4. Rules

1. Canon wins.  
2. Fail-closed.  
3. Chat RU / repo EN.  
4. Portal is edge-only (no mint / no SoT rewrite).  
5. Close work only when acceptance is real.

---

**End of document.**
