# Core-first build path

**Status:** Active  
**Rule:** Portal is **last**. Core must work and be tested before edge UI.

## What the core is

NestJS modules under `src/` that implement AST Token Protocol economics:

| Layer | Modules |
|-------|---------|
| Foundation | `common`, `invariants` |
| Ledger | `nodechain` |
| Network | `nodes`, `node-reputation` |
| Gate | `pot` |
| Value | `emission`, `aroscoin`, `reserve`, `commission` |
| Process | `orchestrator`, `state-recording`, `governance`, `oracle-gateway` |
| Maturity | `release`, `release-daemon`, `velocity-tracker`, `partial-release` |
| Observe | `all-seeing-eye` |
| Edge (later) | `portal/`, `core-api` HTTP |

## Current state (honest)

| Area | Reality |
|------|---------|
| Skeleton | All modules exist; 60+ unit tests |
| PoT + NodeChain write-ahead | Works |
| Mint after PoT | Works |
| Commission 70/30 | Works |
| **Shortcuts removed (Wave 1)** | No `pad-a` fake validators; suspended nodes cannot confirm |
| Still weak | In-memory process maps / balances; document step thin; oracle stub sigs; velocity manual set |

## Waves (order)

1. **Wave 1 — Gate integrity** (done / in progress): PoT ↔ Nodes eligibility; orchestrator real validator set; fail-closed if &lt; 3 confirmers.  
2. **Wave 2 — Token core**: emission ΔValue §9.10 revaluation path; aroscoin burn/transfer + double-mint; reserve child records.  
3. **Wave 3 — Process core**: document validation step real; state-recording full schema; compensation before verified only.  
4. **Wave 4 — Settlement + metrics**: commission weights from reputation; velocity from ledger volume.  
5. **Wave 5 — Durability**: process/token state on ledger projections; file/RocksDB default in tests.  
6. **Wave 6 — Release core**: daemon + governance without portal.  
7. **Wave 7 — Core API only** (HTTP for machines/tests).  
8. **Wave 8 — Portal last** (issuer UI).

## How we work

1. Change **one core layer** at a time.  
2. Unit tests mandatory; e2e tokenize for happy path.  
3. `npm run check:canon` before commit.  
4. No portal feature work until Wave 7 complete unless owner overrides.

## Commands

```bash
npm test
npm run check:canon
npm run cli tokenize -- --inst DEMO --valuation 100 --holder h1
```
