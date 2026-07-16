# AST Build Schedule

**Version:** 1.1  
**Status:** Canonical — **owner pre-approved full execution** (2026-07-16)  
**Source of Truth:** `docs/AST-CORE-CANON.md` + `docs/P0-P4-TECHNICAL-DECISIONS.md`

---

## 1. Purpose

Order and priorities for building AST. Owner confirmed advance approval for all phases; agent executes sequentially without per-step confirmation unless blocked by canon ambiguity.

---

## 2. Build Phases Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | **Complete** |
| 1 | Core Ledger & Validation | **Complete** |
| 2 | Token & Emission | **Complete** (core path) |
| 3 | Orchestration & Portal | **Complete** (core path + portal edge wire) |
| 4 | Governance & Release | **Complete** (core path) |
| 5 | Hardening & Production | **Partial** (kill-switch, CLI, e2e, guards; prod deploy TBD) |

---

## 3. Phase checklist

### Phase 0 — Foundation
- [x] Core Canon, decisions, schedule, architecture, portal docs  
- [x] Protective GitHub Actions  
- [x] Folder structure, README, CONTRIBUTING, `.grok/rules.md`  

### Phase 1 — Core Ledger & Validation
- [x] 1.1 nodechain core (snapshot, hash, integrity)  
- [x] 1.2 storage (file/rocksdb-oriented durable + Postgres index mirror)  
- [x] 1.3 pot-engine (P1–P4, M-of-N quorum, binary verdict)  
- [x] 1.4 PoT → NodeChain write-ahead (`okToEmit` requires ledger height)  
- [x] 1.5 invariants (I1–I9 + CI tests)  
- [x] 1.6 CLI + core HTTP API (`npm run cli`, `/v1/core/processes`)  

### Phase 2 — Token & Emission
- [x] aroscoin mint/burn, 9 decimals, process binding  
- [x] emission valuation + ΔValue + pro-rata plan  
- [x] double-mint protection  
- [x] commission post-factum 70/30  
- [x] ERC-20 **representation adapter** (view-only, not SoT)  
- [x] integration/e2e tokenize flow  

### Phase 3 — Orchestration & Portal
- [x] orchestrator fixed pipeline, idempotency, kill-switch gate  
- [x] state-recording into NodeChain  
- [x] portal backend wired to core API  
- [x] portal frontend scaffold + OpenAPI  
- [x] КЭП required on document upload path (edge)  
- [x] e2e path start → pot → mint → settle  

### Phase 4 — Governance & Release
- [x] All-Seeing Eye observe/notify  
- [x] node reputation + grace  
- [x] release + velocity + daemon  
- [x] partial-release  
- [x] oracle gateway  
- [x] governance multi-step service  

### Phase 5 — Hardening & Production
- [x] kill-switch / read-only  
- [x] protective CI suite  
- [x] e2e + unit tests  
- [x] CLI smoke  
- [ ] Full external security audit (human/org)  
- [ ] Production deploy pipeline (infra TBD)  
- [ ] Monitoring stack (ops TBD)  

---

## 4. Rules

1. Canon wins; no merge that violates it.  
2. Fail-closed default.  
3. Ask owner only on true canon ambiguity.  
4. Chat RU / repo EN.  

---

## 5. How to run

```bash
npm test
npm run check:canon
npm run cli tokenize -- --inst DEMO --valuation 100 --holder h1
# core API: npm run dev  → http://localhost:3000/v1/core/processes/start
```

---

**End of document.**
