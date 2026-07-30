# Operator smoke checklist (C5)

**Purpose:** One command proves Orchestrator · Oracle · Release · Partial-release work together on an in-memory journal.  
**Not** a substitute for portal pilot with real PDF (owner D-track).  
**Not** fake Done: exit non-zero on any step failure.

---

## Quick run

```bash
cd /path/to/Aros-Studio-Tokenomics
npm run smoke:operator
```

Expected final line: **`SMOKE PASS (C5)`** and exit code **0**.

---

## Steps covered

| # | Step id | What must be true |
|---|---------|-------------------|
| 1 | `release.gate_pre` | external `cex_list` blocked **before** primary (I8; daemon inactive) |
| 2 | `release.gate_internal` | `internal_transfer` allowed pre-release |
| 3 | `orchestrator.primary` | PoT verified=1, mint 1000 ARO, commission ~70/30, reserveIndex > 0, chain ok |
| 4 | `release.status_post_primary` | status after primary (may activate via orchestrator tick) |
| 5 | `oracle.m_of_n` | ≥2 valid oracle attestations accepted |
| 6 | `oracle.fail_closed` | single attestation rejected |
| 7 | `partial_release.run` | burn + remint; release 0.2 from AST reserve (within ~0.45 commission share); balance 999.8 |
| 8 | `nodechain.verify` | full hash chain ok |

Script: `scripts/operator-smoke.ts`.

---

## Operator sign-off (manual)

| Check | Yes / No | Notes |
|-------|----------|--------|
| `npm run smoke:operator` PASS | | |
| `npm test` green (optional same day) | | |
| `npm run demo:tokenize` (file/rocksdb) optional | | |
| Understood: smoke is **memory**, not prod secrets | | |
| Owner still owns real PDF portal demo (MVP finish track) | | |

Reviewer: _______________  Date: _______________

---

## Related unit tests

```bash
npm test -- --testPathPattern='orchestrator|release|oracle|partial-release'
```

## Residual (honest)

- Portal document-first e2e with real file (owner)  
- Live multi-oracle keys in production vault  
- Release phase production thresholds / monitoring  
