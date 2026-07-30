# Layer acceptance rollup (C4)

**Date:** 2026-07-30  
**Evidence:** `npm test` — 40 suites / 192 tests · `npm run check:canon` — ALL OK  
**Rule:** No fake Done. Residuals listed are real follow-ons, not hidden gaps in v1 pilot path.

| Layer | Folder | Code | Acceptance file | v1 pilot | Open residual (honest) |
|-------|--------|------|-----------------|----------|-------------------------|
| **01** NodeChain | `01_NodeChain` | `src/nodechain` | `09_acceptance/acceptance-criteria.md` | **Pilot ready** | **B1** owner review sign-off only (B2–B4 code done) |
| **02** TxEncoding | `02_TxEncoding` | `src/tx-encoding` | `09_acceptance/acceptance.md` | **Done** | Optional dedicated HTTP encode API (today in-process) |
| **03** Processing | `03_Processing` | `src/processing` | `09_acceptance/acceptance.md` | **Done** | Multi-instance process RAM cache beyond journal hydrate (hydrate covers crash) |
| **04** PoT | `04_ProofOfTransaction` | `src/pot` | `09_acceptance/acceptance.md` | **Done** | Multi-node BFT for validators; network timeout orchestration beyond module |
| **05** Token / ARO | `05_TokenManagement` | `src/token` + `src/aroscoin` | `09_acceptance/acceptance.md` | **Done** (C3) | Representation adapters live chain deploy (not SoT) |
| **06** FeeCommission | `06_FeeCommission` | `src/commission` | `09_acceptance/acceptance.md` | **Done** | Ops UI / REST for schedule admin; multi-currency fee productization |
| **07** Reserve | `07_Reserve` | `src/reserve` | `09_acceptance/acceptance.md` | **Done** | Full multi-asset product surface; external custody never |
| **08** All-Seeing Eye | `08_AllSeeingEye` | `src/all-seeing-eye` + event-stream | `09_acceptance/acceptance.md` | **Done** (C2) | SSE push; multi-node event fan-out; PagerDuty-class alerting |
| **09** Governance | `09_Governance` | `src/governance` | `09_acceptance/acceptance.md` | **Done** (C1) | Prod LLM secrets; durable L2 across restarts; dedicated REST controller |
| **10** Asset tokenization | `10_AssetTokenization` | `src/intake` | `09_acceptance/acceptance.md` | **Done** (pilot path) | Full X.509/QES chain; OCR scans; production mTLS (portal/ops) |

## Cross-cutting (not a layer)

| Module | Code | Status | Residual |
|--------|------|--------|----------|
| Orchestrator | `src/orchestrator` | Unit tests + **C5 smoke** | — |
| Release / partial-release / oracle | `src/release`, `partial-release`, `oracle-gateway` | Unit tests + **C5 smoke** | Live oracle keys / prod thresholds (ops) |
| Portal edge | `portal/` | Pilot path | QES, OCR, domain hosting (D-track) |
| Index mirror | `src/index-mirror` | B6 wired | Live Postgres in every env (ops) |

## Commands (re-verify rollup)

```bash
npm test
npm run check:canon
npm run check:env
```

## C4 outcome

- Layers **02–10** acceptances reviewed against code + tests.  
- Thin checklists for **06 / 07 / 10** given residual honesty blocks.  
- **01** remains blocked only on **owner B1 sign-off**, not missing implementation.  
