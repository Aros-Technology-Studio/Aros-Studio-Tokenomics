# Component Clarifications (owner questionnaire)

**Status:** P0–P4 **complete** (canonical for v1)  
**Canon:** `/CANON.md` (includes PoT Criteria P1–P4 + §XII operational defaults)

---

# Pack status

| Group | Status |
|-------|--------|
| P0–P3 original 13 components | packs **ready** |
| P4 gaps | **answered** |
| `partial-release` + support modules | packs **ready** |
| `resource_monitor` | **stub / later** (no full pack) |

Detail answers for P0–P3 live in packs + git history. Below: **P4 canonical answers**.

---

# P4 — CANONICAL ANSWERS

## 14. PoT Criteria P1–P4

1. **P1** — Process initiated in allowed architectural context (valid institutional cert + allowlist).  
2. **P2** — Full sequence of execution stages completed.  
3. **P3** — All significant states recorded in NodeChain.  
4. **P4** — Process completed under rules of the specific process type (deterministic result).  
5. Evaluators: **validators (quorum) + Orchestrator (coordination)**.  
6. **All four always** (no asset-class subset in v1).  
7. Versioned with **canon semver**.  
8. Fail any Pi → immediately `verified = 0`.  
9. **Reason codes required** per Pi fail.  
10. Formal text in **CANON** (section PoT Criteria) — done.

## 15. partial-release

1. Name: **`partial-release`**.  
2. Requester: **holder via Portal + institutional approval**.  
3. Dust: **same as ArosCoin**.  
4. Each partial = **full process + new processId**.  
5. **Atomic** burn + reserve child records.  
6. Pre–Release Phase: **internal only**.  
7. **Pro-rata** holder impact.  
8. Governance **lighter** than full phase change.  
9. NodeChain: ExecutionSnapshot + `partialRelease` payload.  
10. Link: **burn + remint** (claim split).

## 16. Extra modules

1. `release_daemon` — **real v1**  
2. `velocity_tracker` — **real v1**  
3. `node_reputation_service` — **real v1**  
4. `resource_monitor` — **stub → later**  
5. `ledger` vs `nodechain` — **one binary** (`nodechain_engine` + ledger store)  
6. Oracle: module **`oracle_gateway`**, multi-oracle + signature verification  
7. Settlement = **commission** (alias)  
8. AI L1 — **mandatory** (document validation + basic risk)  
9. AI L2/L3 — **optional** (advanced anomaly detection)  
10. Frontend/portal — **yes**, this repo v1 (`/portal`)

## 17. Defaults

| Item | Value |
|------|--------|
| PoT timeout | 15 min |
| Per-step orchestrator timeout | 5 min default (configurable) |
| Suspend grace | 24 h |
| Min dust ARO | 0.000000001 |
| Commission split | 70/30 ship default |
| Config keys | `release.threshold`, `release.target` |
| Ledger engine | RocksDB |
| Money | decimal.js |
| processId prefix | `AST-{INST}-{YYYYMMDD}-` |
| Sandbox feeRate | 0.15% |

(Also in `CANON.md` §XII.)

## 18. Cross-cutting

1. Compensatable: **everything before PoT verified**. After verified — **not compensatable**.  
2. Mint ok, settlement fail → **retry settle** (no burn-compensate).  
3. Oracle fail → **fail-closed / expired**.  
4. Multi-node institution → **1 vote total** per institutional cert.  
5. Eye mirror lag max → **30 s**.  
6. Kill switch / read-only → **yes v1**.  
7. Envs: `local`, `test`, `sandbox`, `prod`.  
8. Document languages: **any** (signature + metadata only; no text NLP required).  
9. Clock: **UTC only**.  
10. Must before first `src/` PR: Core Canon fixed; P0–P4 recorded; scaffold `/portal`, `/nodechain`, `/pot-engine`; protective GitHub Actions — **satisfied when this commit lands**.
