# Document Map

**Status:** Full docs tree live (2026-07-16) — processes + architecture + modules + component packs  
**Principle:** [ANTI_POLICE.md](./principles/ANTI_POLICE.md)  
**Canon:** `docs/AST-CORE-CANON.md` (root `CANON.md` is pointer only)

Registry of documentation surfaces and target code paths.

**Progressive fill rule:** Core Canon → decisions → module/process docs → component packs → code. Parallel work is allowed when packs do not conflict.

---

## Sources of truth

1. `docs/AST-CORE-CANON.md` — sole full source of truth  
2. `docs/P0-P4-TECHNICAL-DECISIONS.md` — ratified decisions  
3. `docs/modules/`, `docs/processes/`, `docs/architecture/`, `docs/components/` — derived specs  
4. `src/` — implementation (must conform)

---

## Documentation surfaces

| Path | Role |
|------|------|
| `docs/AST-CORE-CANON.md` | Sole law |
| `docs/ARCHITECTURE.md` | High-level architecture |
| `docs/architecture/` | system-context, data-flow, security-model, deployment, portal |
| `docs/processes/` | End-to-end business processes |
| `docs/modules/` | Deep module specs (README + topics + API) |
| `docs/components/` | 4-file packs (PURPOSE/MODEL/CONTRACT/ACCEPTANCE) |
| `docs/ROADMAP.md` / `BUILD_SCHEDULE.md` | Plan and build order |
| `docs/README.md` | Docs entry / tree |

Module deep-docs map 1:1 to the owner’s target tree under `docs/modules/*`.  
Component packs remain the **implementation acceptance** surface.

---

## Root docs

| Path | Status | Role |
|------|--------|------|
| `CANON.md` | exists | Pointer to Core Canon |
| `docs/README.md` | exists | Docs entry |
| `docs/ARCHITECTURE.md` | living | End-to-end view |
| `docs/DOC_MAP.md` | exists | This registry |
| `docs/principles/ANTI_POLICE.md` | exists | Working rule |
| `docs/components/_template/` | exists | Pack template |
| `docs/modules/` | exists | Module deep specs |
| `docs/processes/` | exists | Process specs |
| `docs/architecture/` | exists | Architecture detail |

---

## Canonical components (`src/` — CANON §3)

Unit of documentation = **runtime component**. Layer folders (`02_…`, `10_…`) from migration plans may map later; they are not required to create a pack.

| Priority | Component | Docs pack | Pack status | Target code | Notes |
|----------|-----------|-----------|-------------|-------------|--------|
| P0 | `invariants` | `components/invariants/` | **ready** | `src/invariants/` | I1–I9; assert+checkAll+InvariantBroken |
| P0 | `pot` | `components/pot/` | **ready** | `src/pot/` | Sole gate for value; M-of-N; no amount math |
| P0 | `aroscoin` | `components/aroscoin/` | **ready** | `src/aroscoin/` | ARO/9; emission-after-PoT only |
| P0 | `reserve` | `components/reserve/` | **ready** | `src/reserve/` | Own funds; bag accounting; reserveIndex |
| P1 | `nodechain` | `components/nodechain/` | **ready** | `src/nodechain/` | Linear append-only SoT; Postgres index mirror |
| P1 | `nodes` | `components/nodes/` | **ready** | `src/nodes/` | Cert+keys; mTLS; fixed roles; ARO post-factum pay |
| P1 | `emission` | `components/emission/` | **ready** | `src/emission/` | Valuation+ΔValue; calls aroscoin.mint; I9 pro-rata |
| P1 | `commission` | `components/commission/` | **ready** | `src/commission/` | On-PoT settlement; default 70/30; full simple engine |
| P1 | `all-seeing-eye` | `components/all-seeing-eye/` | **ready** | `src/all-seeing-eye/` | Separate process; observe/notify only |
| P2 | `orchestrator` | `components/orchestrator/` | **ready** | `src/orchestrator/` | Sole economic entry; fixed pipeline; saga compensation |
| P2 | `state-recording` | `components/state-recording/` | **ready** | `src/state-recording/` | Process snapshots inside NodeChain; write-ahead |
| P2 | `release` | `components/release/` | **ready** | `src/release/` | Release Phase gates; split from partial-release |
| P3 | `common` | `components/common/` | **ready** | `src/common/` | Technical utils only; barrel exports; decimal.js |
| P4 | `partial-release` | `components/partial-release/` | **ready** | `src/partial-release/` | Split from phase; holder+institution; full process |
| P4 | `release-daemon` | `components/release-daemon/` | **ready** | `src/release-daemon/` | Full pack 2026-07-16; thresholds initiate |
| P4 | `velocity-tracker` | `components/velocity-tracker/` | **ready** | `src/velocity-tracker/` | Full pack 2026-07-16; §9.6 formula |
| P4 | `node-reputation` | `components/node-reputation/` | **ready** | `src/node-reputation/` | Full pack 2026-07-16; no slashing |
| P4 | `oracle-gateway` | `components/oracle-gateway/` | **ready** | `src/oracle-gateway/` | Full pack 2026-07-16; multi-oracle + signatures |
| later | `resource_monitor` | — | stub | — | Deferred |
| edge | Institutional Portal | `docs/architecture/INSTITUTIONAL_PORTAL.md` | scaffold | `portal/` | Next.js + Nest edge; OpenAPI under `portal/openapi/` |

Pack status values: `missing` | `draft` | `ready` | `implemented`.  

**Documentation:** P0–P4 packs exist; P4 support packs expanded to full PURPOSE/MODEL/CONTRACT/ACCEPTANCE (not stubs).  
**Implementation:** core path present under `src/`; treat as draft until ACCEPTANCE implementation checkboxes close (durable feeds, portal polish, prod ops = Phase 5).

Target layout aliases (scaffold): `/nodechain` ↔ nodechain engine+ledger; `/pot-engine` ↔ pot; `/portal` ↔ institutional UI (v1 in-repo).

---

## Pack contents (fixed)

Every component folder uses exactly:

```
PURPOSE.md
MODEL.md
CONTRACT.md
ACCEPTANCE.md
DIAGRAM.md   # Mermaid-only diagrams (added 2026-07-16)
```

Copy from `components/_template/` for the four prose files. `DIAGRAM.md` is Mermaid diagrams only (flowcharts, state, sequence).

Module deep-docs under `docs/modules/<name>/` also include `DIAGRAM.md` (Mermaid only).

---

## Optional later mapping (not blocking)

| Migration / target layer | Primary components |
|--------------------------|--------------------|
| `02_nodechain_engine` | `nodechain`, `nodes`, `state-recording` |
| `03_token_management_layer` | `aroscoin`, `emission`, `release` |
| `08_fee_distribution` | `commission` |
| `10_proof_of_transaction_engine` | `pot` |
| `13_extra_supervisory_layer` | `all-seeing-eye` |
| `15_reserve` | `reserve` |
| `06_governance_layer` | AI hierarchy (see CANON); not a police layer |
| `07_processing_layer` | `orchestrator` + pipeline |
| `14_decentralized_tx_encoding` | encoding utilities (may live under `common` or `nodechain`) |

---

## Build order (docs first for P0)

1. `invariants`  
2. `pot`  
3. `reserve`  
4. `aroscoin`  
5. Then P1 → P2 → P3  

Code for a component follows its pack when the pack is sufficient to implement without guessing canon.
