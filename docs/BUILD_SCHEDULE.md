# AST Build Schedule

**Version:** 3.0  
**Status:** Synced with implementation on `main` (post clean-slate rebuild)  
**Source of Truth:** `docs/AST-CORE-CANON.md` + `docs/P0-P4-TECHNICAL-DECISIONS.md`

---

## 1. Purpose

Order of work for AST. **Docs first**, then core. No freelanced code. No fake Done.

**Portal:** edge under `portal/` — not Core SoT; no mint from portal.

---

## 2. Build Phases Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation (docs tree by layers/modules) | **Done** |
| 1 | Core Ledger & Validation | **Done** |
| 2 | Token & Emission | **Done** |
| 3 | Orchestration | **Done** |
| 4 | Governance & Release | **Done** (L3 LLM optional via env) |
| 5 | Hardening | **In progress → Done for #68–#70** |

---

## 3. Phase checklist

### Phase 0 — Foundation
- [x] Layer + module documentation tree (`docs/layers/01–10`)
- [x] Acceptance criteria per layer
- [x] Architecture map from Core Canon
- [x] Protective guards (CI)

### Phase 1 — Core Ledger & Validation
- [x] NodeChain (memory / file / RocksDB)
- [x] PoT engine (P1–P4, M-of-N, attestations, challenges)
- [x] PoT → NodeChain write-ahead
- [x] Invariants I1–I9 + ok-to-emit

### Phase 2 — Token & Emission
- [x] ArosCoin mint/burn (PoT-gated)
- [x] Emission / ΔValue
- [x] Commission post-factum 70/30
- [x] Reserve (own funds + reserveIndex)

### Phase 3 — Orchestration
- [x] Fixed pipeline orchestrator (`src/orchestrator`)
- [x] State on NodeChain (`process_*`, `orchestrator_step`)
- [x] Idempotency / fail-closed
- [x] Core API `/v1/core/*`
- [x] Portal edge scaffold + core hand-off client

### Phase 4 — Governance & Release
- [x] All-Seeing Eye (observe/notify only)
- [x] Node registry + reputation
- [x] Release phase (velocity + daemon + I8 gate)
- [x] Oracle gateway (multi-oracle fail-closed)
- [x] Partial-release process
- [x] L3 policy panel + formal LLM adapters (`AST_L3_USE_LLM`)

### Phase 5 — Hardening
- [x] Tests against specs (Jest + guards)
- [x] Kill-switch
- [x] HSM / pluggable KeyProvider (`AST_KEY_PROVIDER=hsm|file|memory`)
- [x] Journal replication catch-up (`JournalReplicator`)
- [x] Institution auth + qualified signature verify
- [ ] External audit / prod (owner-driven)

---

## 4. Rules

1. Canon wins.  
2. Fail-closed.  
3. Chat RU / repo EN.  
4. Portal is edge-only (no mint / no SoT rewrite).  
5. Close work only when acceptance is real.

---

**End of document.**
