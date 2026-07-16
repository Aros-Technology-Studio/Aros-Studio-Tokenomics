# AST Work Plan

**Status:** Active  
**Date:** 2026-07-14  
**Language:** English (repository)  
**Chat with product owner:** Russian  

Aligns with `CANON.md` §15, `docs/DOC_MAP.md`, `docs/principles/ANTI_POLICE.md`, and `AGENTS.md`.

---

## 0. Rules of engagement

| Rule | Meaning |
|------|---------|
| Sources of truth | `CANON.md` (Core Canon v1.0 Final) → `docs/` → `src/` |
| Language | Repo = English; conversation = Russian |
| Docs pack | Exactly 4 files: PURPOSE, MODEL, CONTRACT, ACCEPTANCE |
| Anti-police | Invariants + fail-closed structure; Eye observes only (no veto) |
| Cadence | Docs for a component → brief owner check on substance → code + tests |
| No ceremony | One sensible PR per coherent slice; no multi-gate sign-off theater |

---

## 1. Current baseline (done)

| Item | State |
|------|--------|
| Repo scaffold (NestJS, Docker, CI) | done |
| `CANON.md` | tracked |
| `AGENTS.md` (language + process) | tracked |
| `docs/` structure, DOC_MAP, ARCHITECTURE scaffold, ANTI_POLICE, template | done, on main |
| Component packs content | **not started** |
| `src/` modules per CANON §3 | **skeleton only** (`app.*`) |

---

## 2. Phase A — Documentation (component packs)

Goal: every P0/P1 component has a pack that is implementable without guessing canon.

### A0 — Confirm understanding (gate: owner “yes”)

- Component descriptions reviewed with product owner  
- Corrections folded into packs as they are written  

### A1 — P0 packs (serial; each blocks the next if canon is unclear)

| Order | Component | Outcome |
|------:|-----------|---------|
| 1 | `invariants` | I1–style table from CANON §12; checkable effects |
| 2 | `pot` | Confirm work; verdict model; no emission without PoT |
| 3 | `reserve` | AST own funds only; reserveIndex from confirmed volume |
| 4 | `aroscoin` | AST Token Protocol; mint/burn via PoT + NodeChain |

After each pack: short owner review (substance only) → mark pack `ready` in `DOC_MAP.md`.

### A2 — P1 packs

| Order | Component | Outcome |
|------:|-----------|---------|
| 5 | `nodechain` | process graph + own ledger |
| 6 | `nodes` | register / auth contracts |
| 7 | `emission` | formula \(T_E = \alpha\cdot TV + \beta\cdot U + \gamma\); constants marked canon vs proposed |
| 8 | `commission` | model only from canon; open items listed if thin |
| 9 | `all-seeing-eye` | observe / notify only; no veto, no rollback |

### A3 — P2 / P3 packs

| Order | Component | Outcome |
|------:|-----------|---------|
| 10 | `release` | full/partial return path; burn + free reserve |
| 11 | `orchestrator` | process order; hierarchy hooks (no police) |
| 12 | `state-recording` | causal state write |
| 13 | `common` | shared utilities boundary only |

### A4 — Cross-cut docs

- Flesh out `docs/ARCHITECTURE.md` (one full cycle + interfaces)  
- Keep `DOC_MAP.md` pack statuses current  
- Optional later: `docs/AST_Developer_Deep_Dive.md` (named in CANON §16; create when packs stabilize)

**Phase A exit:** P0 packs `ready`; P1 at least `draft`; ARCHITECTURE usable for implementers.

---

## 3. Phase B — Implementation (code by component)

Goal: NestJS modules under `src/<name>/` with unit tests; no invented economics.

### B0 — Scaffold modules

- Create `src/` folders matching CANON §3  
- Wire empty Nest modules into `app.module` only as needed  

### B1 — P0 code (same order as docs)

1. `invariants` — pure checks / types  
2. `pot` — verdict pipeline  
3. `reserve` — binding model  
4. `aroscoin` — mint/burn against reserve rules  

### B2 — P1 code

`nodechain`, `nodes`, `emission`, `commission`, `all-seeing-eye`

### B3 — P2 / P3 code

`release`, `orchestrator`, `state-recording`, `common`

### B4 — Contract surface (as canon requires)

- `ArosCoinReserveManager.sol` (or path under smart-contracts when added) for rate / mint / burn binding  
- Keep Solidity limited to reserve claim mechanics (CANON §4)

**Per component definition of done:**

- Pack `ready`  
- Code + `.spec.ts` for happy path and invariant-preserving failure  
- No Russian in repo  
- No policing language or punitive mechanics  

---

## 4. Phase C — Integration (CANON §15 Phase 3)

- API / event contracts between modules match `CONTRACT.md` files  
- Fail-closed paths when PoT/NodeChain missing; no Eye veto/rollback  
- E2E: confirmed process → mint/burn via AST Token Protocol  
- Eye notification path on recorded invariant breach (observe only)  

**Phase C exit:** green CI; e2e for the one economic cycle.

---

## 5. Phase D — Deploy (CANON §15 Phase 4)

| Step | Target |
|------|--------|
| D1 | Test network / local docker-compose full stack |
| D2 | Sandbox (NBG context as product requires) |
| D3 | Production readiness (ops, secrets, monitoring — not policing) |

Do not start D until C exit criteria are met unless owner prioritizes a thin demo slice.

---

## 6. Immediate next actions (this week)

1. **Push** pending commit (`AGENTS.md` + `CANON.md`) if not yet on origin  
2. Commit this `WORK_PLAN.md`  
3. Owner confirms component understanding (or sends corrections)  
4. Write **P0 pack `invariants`** (4 English files)  
5. Owner skim → write **`pot`** pack  
6. Then `reserve` → `aroscoin`  

No code until first P0 pack is good enough to implement against (or owner says “code skeleton in parallel”).

---

## 7. Out of scope for now

- Transfer of old 01–14 layer trees as primary structure (optional map only; runtime unit = `src/*`)  
- Frontend portal  
- Full AI Python layer (orchestrator hooks only until owner prioritizes)  
- Speculative tokenomics (caps, staking-for-yield, governance-by-holding)  

---

## 8. Tracking

| Artifact | Use |
|----------|-----|
| `docs/DOC_MAP.md` | pack status per component |
| `docs/WORK_PLAN.md` | this plan |
| GitHub commits / PRs | delivery units |

Update this file when phase exits change or owner reprioritizes — not after every chat message.
