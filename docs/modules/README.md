# AST Modules — Documentation Index

**Status:** Module documentation layer  
**Law:** [`docs/AST-CORE-CANON.md`](../AST-CORE-CANON.md) (sole full source of truth)  
**Decisions:** [`docs/P0-P4-TECHNICAL-DECISIONS.md`](../P0-P4-TECHNICAL-DECISIONS.md)  
**Packs:** [`docs/components/*`](../components/)  
**Language:** English (repository language)

This tree maps **implementation modules** to durable design notes. Component packs remain the detailed CONTRACT/MODEL/PURPOSE surface; module docs explain how a module behaves as a unit of the build and how it maps to code.

---

## Mapping: module → code

| Module docs | Code path | Canon name / role |
|-------------|-----------|-------------------|
| [`nodechain/`](./nodechain/) | `src/nodechain` | `nodechain_engine` / ledger — sole source of truth |
| [`pot-engine/`](./pot-engine/) | `src/pot` | `proof_of_transaction_engine` — sole value gate |
| [`aroscoin/`](./aroscoin/) | `src/aroscoin` | AST Token Protocol / ArosCoin accounting |
| [`emission/`](./emission/) | `src/emission` | valuation-driven mint/burn planning |
| [`commission/`](./commission/) | `src/commission` | settlement / post-factum node payment |
| [`common/`](./common/) | `src/common` | money, ids, errors, crypto (no domain rules) |
| [`orchestrator/`](./orchestrator/) | `src/orchestrator` | sole economic entry; fixed 9-step pipeline |
| [`all-seeing-eye/`](./all-seeing-eye/) | `src/all-seeing-eye` | observe / record / notify only |
| [`portal/`](./portal/) | `portal/` | institutional edge Next.js + Nest |
| [`oracle-gateway/`](./oracle-gateway/) | `src/oracle-gateway` | multi-oracle transport + signatures |
| [`release/`](./release/) | `src/release` (+ daemon, partial-release, velocity-tracker) | Release Phase + partial release split |

---

## Documented modules (this tree)

### Core economic / ledger (complete)

| Module | Primary topics |
|--------|----------------|
| [nodechain](./nodechain/) | Linear append-only ledger, ExecutionSnapshot, RocksDB + Postgres mirror |
| [pot-engine](./pot-engine/) | P1–P4 criteria, quorum M-of-N, verified 0\|1, timeout |
| [aroscoin](./aroscoin/) | Token protocol layers, mint/burn, representation adapters |
| [emission](./emission/) | Institutional valuation, ΔValue, §9.10, I9 pro-rata |
| [commission](./commission/) | Fee schedules, settleCommission, 70/30 split |
| [common](./common/) | processId, decimal.js, AstErrorCode, crypto primitives |

### Orchestration, monitoring, edge, oracle, release (complete)

| Module | Path | Primary topics |
|--------|------|----------------|
| **orchestrator** | [`orchestrator/`](./orchestrator/) | Sole economic entry; 9-step pipeline; saga pre-`verified=1`; idempotency; 5m/30m; max 10 concurrent |
| **all-seeing-eye** | [`all-seeing-eye/`](./all-seeing-eye/) | Observe/record/notify only; reason codes; mirror lag ≤30s; no veto/mint |
| **portal** | [`portal/`](./portal/) | Institutional edge; КЭП; OpenAPI; Orchestrator-only economic actions |
| **oracle-gateway** | [`oracle-gateway/`](./oracle-gateway/) | Multi-oracle + signatures; transport only; fail-closed; NodeChain on accept |
| **release** | [`release/`](./release/) | Phase vs partial split; daemon; reserveIndex∧velocity; pre-phase blocks |

Related packs also exist for: `nodes`, `node-reputation`, `reserve`, `partial-release`, `state-recording`, `velocity-tracker`, `invariants`, `release-daemon`.

---

## Hard boundaries (all modules)

- **No free mint** — mint only after PoT `verified = 1` and NodeChain record.  
- **No ERC-as-SoT** — ERC adapters are representations; NodeChain + PoT remain truth.  
- **No third-party custody** — AST holds only own funds (reserves, commissions, own capital).  
- **No Eye powers** in economic modules — Eye never mints, burns, pays, vetoes, or rolls back.

---

## How to use

1. Read Core Canon for the rule.  
2. Read P0–P4 decisions for the ratified default.  
3. Read the component pack for CONTRACT/MODEL.  
4. Use this tree for module-level narrative and API/storage shape.  
5. Code last; on conflict, **Core Canon wins**.

---

## Vocabulary gates (recurring)

| Prefer | Avoid |
|--------|--------|
| execution record, state entry, ledger height | product-API word **blocks** |
| payment, settlement, commission | yield / farming / staking vocabulary |
| institutional valuation | system self-appraisal of assets |
| post-factum payment | pre-paid work pay as income without confirmation |
