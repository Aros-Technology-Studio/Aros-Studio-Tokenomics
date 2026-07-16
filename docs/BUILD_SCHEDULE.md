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
| 0 | Foundation | Canon, structure, protection | 1–2 weeks | **Complete** (owner approved 2026-07-16) |
| 1 | Core Ledger & Validation | NodeChain + PoT | 3–4 weeks | **Active** |
| 2 | Token & Emission | ArosCoin + Emission Engine | 3 weeks | Planned |
| 3 | Orchestration & Portal | Orchestrator + Institutional Portal | 4 weeks | Planned |
| 4 | Governance & Release | Eye, Release Phase, monitoring | 3 weeks | Planned |
| 5 | Hardening & Production | Security, CI/CD, audit, launch | 3–4 weeks | Planned |

---

## 3. Detailed Build Schedule

### Phase 0 — Foundation

**Status:** Complete (owner approved).

**Exit criteria met:** protective workflows, SoT path, structure, `.grok/rules.md`, README/CONTRIBUTING, `check:canon` green.

---

### Phase 1 — Core Ledger & Validation

**Goal:** Immutable ledger and confirmation mechanism.

**Order of work:**

1. [x] `nodechain` core (append-only ledger, ExecutionSnapshot, content hashing)  
2. [x] Storage layer (durable primary via LedgerStore: file/rocksdb-oriented + Postgres **index mirror only**)  
3. [ ] `pot-engine` (P1–P4 criteria, quorum, binary verdict) — harden vs draft  
4. [ ] Integration: PoT → NodeChain write-ahead  
5. [ ] Basic invariants + CI tests (align with Phase 1)  
6. [ ] Minimal CLI / internal API for testing  

**Exit criteria:**  
Create process → pass PoT → write immutable snapshot to NodeChain.

---

### Phase 2 — Token & Emission

*(unchanged — not started)*

1. `aroscoin` core  
2. Emission engine  
3. Double-mint protection  
4. Commission / settlement  
5. Representation adapters (ERC-20 stub)  
6. Full integration tests  

---

### Phase 3 — Orchestration & Portal

*(unchanged — not started as phase)*

---

### Phase 4 — Governance & Release

*(unchanged — not started as phase)*

---

### Phase 5 — Hardening & Production

*(unchanged — not started)*

---

## 4. Rules for Development

1. No code merges to `main` if it violates the canon.  
2. Invariant-touching changes require `docs/AST-CORE-CANON.md` update.  
3. Documentation and tests first → then implementation within the phase step.  
4. Fail-closed by default.  
5. Follow `.grok/rules.md`.  
6. Legacy only via migration gate.  
7. Chat RU / repo EN.  

---

## 5. Current Priority

**Active:** Phase 1 steps 1–2 complete → **next:** Phase 1 step 3 (`pot-engine` harden).

Do not start Phase 2–5 until Phase 1 exit criteria are met.

---

## 6. Draft `src/`

Provisional code must be brought in line with Phase 1 docs as steps execute. Phase 1.1 re-grounds `src/nodechain` on the pack + Core Canon.

---

**End of document.**
