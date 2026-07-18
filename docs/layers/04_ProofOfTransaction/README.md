# 04_ProofOfTransaction (PoT)

**Layer number:** `04`  
**Code:** `src/pot/`  
**Canon:** Core Canon §4.2, §XI I1; P0–P4 decisions (`pot`)  
**Status:** Full v1 specification + implementation

---

## One sentence

PoT is the **only gate** for the origin and change of value: a binary `verified ∈ {0,1}` verdict from criteria **P1–P4** plus confirmer quorum, journaled on NodeChain **before** any mint or settlement.

---

## What this layer is

| Responsibility | Detail |
|----------------|--------|
| Admissibility | P1–P4 conjunction (any fail → `verified=0`) |
| Quorum | M-of-N confirmers (default 2/3, K≥3) |
| Evidence | processId, stages, journal facts, tip hashes, validator set |
| Verdict | Binary, reason codes, final when `verified=1` |
| Write-ahead | `pot_evidence` + `pot_verdict` on NodeChain before emission |
| Determinism | Pure functions of recorded inputs |
| Uniqueness | One final verdict per processId |

## What this layer is not

| Not here | Owner |
|----------|--------|
| Amount / fee / mint math | Token, commission |
| Process stage machine | Layer 03 Processing |
| Journal storage | Layer 01 NodeChain |
| Eye veto / halt API | Forbidden; ASE observes only |
| Stake-weighted voting | Forbidden |

---

## Directory map

```text
04_ProofOfTransaction/
├── README.md
├── 00_scope/          purpose, non-goals, boundaries
├── 01_model/          criteria, quorum, evidence, verdict, codes, timeouts
├── 02_process/        verify flow, admissibility, double-confirm, write-ahead
├── 03_api/            service contracts
├── 04_integration/    NodeChain, processing, emission, ASE
├── 05_diagrams/       mermaid
└── 09_acceptance/     criteria + test plan
```

## Code map

| File | Role |
|------|------|
| `src/pot/types.ts` | Evidence, verdict, config types |
| `src/pot/reason-codes.ts` | Stable reason code constants |
| `src/pot/criteria.ts` | Pure P1–P4 evaluation |
| `src/pot/quorum.ts` | M-of-N quorum |
| `src/pot/evidence-builder.ts` | Build evidence from journal + process |
| `src/pot/pot.service.ts` | Orchestrate verify + journal writes |
| `src/pot/pot.module.ts` | Nest export |

## Verify

```bash
npm test -- --testPathPattern=pot
npm run demo:tokenize -- --engine rocksdb
```
