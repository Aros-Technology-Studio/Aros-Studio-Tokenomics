# AST Build Schedule

**Version:** 1.0  
**Status:** Canonical  
**Date:** 2026-07-16  
**Source of Truth:** `docs/AST-CORE-CANON.md` + `docs/P0-P4-TECHNICAL-DECISIONS.md`

---

## 1. Purpose

This document defines the **order and priorities** for building Aros Studio Tokenomics (AST).  
All work must follow the sequence below. Deviations require a formal canon/schedule amendment.

**Working rule:** Documentation and structure first → then implementation by phase. No freelancing outside the active phase without owner approval. On ambiguity of canon or decisions → **stop and ask the product owner**.

---

## 2. Build Phases Overview

| Phase | Name | Goal | Duration (estimate) | Status |
|-------|------|------|---------------------|--------|
| 0 | Foundation | Canon, structure, protection | 1–2 weeks | **In Progress** |
| 1 | Core Ledger & Validation | NodeChain + PoT | 3–4 weeks | Planned |
| 2 | Token & Emission | ArosCoin + Emission Engine | 3 weeks | Planned |
| 3 | Orchestration & Portal | Orchestrator + Institutional Portal | 4 weeks | Planned |
| 4 | Governance & Release | Eye, Release Phase, monitoring | 3 weeks | Planned |
| 5 | Hardening & Production | Security, CI/CD, audit, launch | 3–4 weeks | Planned |

---

## 3. Detailed Build Schedule

### Phase 0 — Foundation (Current)

**Goal:** Prepare the repository for safe agent-driven development.

**Deliverables:**

- [x] `docs/AST-CORE-CANON.md` (final Core Canon)
- [x] `docs/P0-P4-TECHNICAL-DECISIONS.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/PORTAL.md`
- [x] `docs/ROADMAP.md`
- [x] `docs/BUILD_SCHEDULE.md` (this document)
- [x] Protective GitHub Actions workflows
- [x] Base folder structure (`/nodechain`, `/pot-engine`, `/aroscoin`, `/portal`, …)
- [x] `.grok/rules.md` for Grok Build
- [x] Root `README.md` and `CONTRIBUTING.md`
- [x] Root `CANON.md` pointer → `docs/AST-CORE-CANON.md`

**Exit criteria:**  
Protective workflows green; canon protected against violations; repository structure fixed; owner accepts Phase 0 complete.

---

### Phase 1 — Core Ledger & Validation

**Goal:** Immutable ledger and confirmation mechanism.

**Order of work:**

1. `nodechain` core (append-only ledger, ExecutionSnapshot, content hashing)  
2. Storage layer (RocksDB primary + Postgres mirror)  
3. `pot-engine` (P1–P4 criteria, quorum, binary verdict)  
4. Integration: PoT → NodeChain write-ahead  
5. Basic invariants + CI tests  
6. Minimal CLI / internal API for testing  

**Exit criteria:**  
Create process → pass PoT → write immutable snapshot to NodeChain.

---

### Phase 2 — Token & Emission

**Goal:** Process emission and token.

**Order of work:**

1. `aroscoin` core (mint/burn, 9 decimals, processId binding)  
2. Emission engine (valuation + ΔValue → pro-rata)  
3. Double-mint protection  
4. Commission / settlement (post-factum)  
5. Representation adapters (ERC-20 adapter stub first)  
6. Full integration tests (PoT → emission → NodeChain)  

**Exit criteria:**  
Institutional valuation → PoT → ARO emission → NodeChain record.

---

### Phase 3 — Orchestration & Portal

**Goal:** System usable for institutional participants.

**Order of work:**

1. Orchestrator (fixed pipeline, saga compensation pre-verified only, idempotency)  
2. State-recording service  
3. Portal backend (NestJS edge)  
4. Portal frontend (Next.js 15)  
5. Digital signature flow (qualified e-signature)  
6. End-to-end tokenization user flow  

**Exit criteria:**  
Institution can enter the portal, upload signed documents, and complete tokenization.

---

### Phase 4 — Governance & Release

**Goal:** Monitoring, reputation, Release Phase.

**Order of work:**

1. The All-Seeing Eye (observe + notify only)  
2. `node_reputation_service`  
3. `release_daemon` + `velocity_tracker`  
4. Partial-release module  
5. Oracle Gateway (basic multi-oracle)  
6. Governance approval flows  

**Exit criteria:**  
System tracks maturity thresholds and can safely activate Release Phase.

---

### Phase 5 — Hardening & Production

**Goal:** Real-use readiness.

**Order of work:**

1. Full security review  
2. Kill-switch / read-only mode  
3. Production CI/CD  
4. Monitoring & alerting  
5. Documentation freeze  
6. External audit preparation  

---

## 4. Rules for Development

1. No code merges to `main` if it violates the canon.  
2. Changes that touch invariants require updating `docs/AST-CORE-CANON.md` (and keeping root pointer coherent).  
3. **Documentation and tests first → then implementation** (within each phase).  
4. Fail-closed is the default behaviour.  
5. Grok Build must follow `.grok/rules.md` (strict canon, no invention, ask on ambiguity).  
6. Legacy migration only via `migration/inbox` + migration gate + human checklist.  
7. Chat with product owner: **Russian**. Repository artifacts: **English**.  

---

## 5. Current Priority (as of 2026-07-16)

**Immediate (Phase 0 close-out):**

1. [x] Protective GitHub Actions workflows  
2. [x] Fix folder structure  
3. [x] Add `.grok/rules.md`  
4. [x] Protected commit with foundation documentation  

**Next after owner confirms Phase 0 exit:** begin **Phase 1, step 1** only (`nodechain` core per schedule) — not Phase 2–5.

---

## 6. Relation to draft code under `src/`

Any existing `src/` code is **provisional draft**. It may be reconciled, rewritten, or discarded when Phase 1–4 execute **from approved docs**. It is not an alternate canon.

---

**End of document.**
