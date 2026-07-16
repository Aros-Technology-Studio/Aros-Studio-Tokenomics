# Architecture documentation index

**Product:** Aros Studio Tokenomics (AST)  
**Sole law:** [`docs/AST-CORE-CANON.md`](../AST-CORE-CANON.md)  
**Decisions:** [`docs/P0-P4-TECHNICAL-DECISIONS.md`](../P0-P4-TECHNICAL-DECISIONS.md)  
**Parent overview:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)

This folder holds **focused architecture views**. Prose here elaborates; it never overrides Core Canon. If any file conflicts with the canon, **Core Canon wins**.

---

## Documents in this folder

| File | Description |
|------|-------------|
| [`system-context.md`](./system-context.md) | Actors (institutions, nodes, holders), portal edge, NestJS core, NodeChain SoT, oracles, ERC adapters outside SoT; custody and valuation boundaries; C4-style context diagram |
| [`data-flow.md`](./data-flow.md) | Primary tokenization; PoT → NodeChain → Emission → Settlement spine; Release metrics; Eye observation plane (async, no mint command) |
| [`security-model.md`](./security-model.md) | Selective custody; mTLS / КЭП / allowlists; kill switch; invariants I1–I9 as security properties; fail-closed; Eye observe-only; encryption at rest |
| [`deployment.md`](./deployment.md) | Envs local/test/sandbox/prod; Node ≥ 20, NestJS core, Next.js portal; RocksDB + Postgres mirror; CI/`check:canon`; Phase 5 prod TBD; Eye separate process |
| [`INSTITUTIONAL_PORTAL.md`](./INSTITUTIONAL_PORTAL.md) | Institutional portal edge architecture (routes, stack, API surface) — **retained product architecture** |

---

## Parent and sibling docs (outside this folder)

| Path | Role |
|------|------|
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | Living architecture overview: component map, pipeline, release, invariant checklist |
| [`../PORTAL.md`](../PORTAL.md) | Institutional portal product architecture (edge entry, no economic side doors) |
| [`../AST-CORE-CANON.md`](../AST-CORE-CANON.md) | Full Core Canon (sole law) |
| [`../P0-P4-TECHNICAL-DECISIONS.md`](../P0-P4-TECHNICAL-DECISIONS.md) | Ratified technical decision register |
| [`../BUILD_SCHEDULE.md`](../BUILD_SCHEDULE.md) | Phase order and completion honesty |
| [`../WORKFLOWS.md`](../WORKFLOWS.md) | Cross-component workflows |
| [`../processes/primary-tokenization.md`](../processes/primary-tokenization.md) | Primary tokenization process steps |
| [`../processes/partial-release.md`](../processes/partial-release.md) | Partial release process |
| [`../components/`](../components/) | Per-module PURPOSE · MODEL · CONTRACT · ACCEPTANCE packs |
| [`../principles/ANTI_POLICE.md`](../principles/ANTI_POLICE.md) | Structural guards over policing narratives |
| [`../DOC_MAP.md`](../DOC_MAP.md) | Documentation registry |

---

## How to use

1. Read **Core Canon**, then **P0–P4**, then the parent **ARCHITECTURE** overview.  
2. Use **system-context** for boundaries and actors; **data-flow** for sequences; **security-model** for guards; **deployment** for runtime topology.  
3. Use **INSTITUTIONAL_PORTAL** / **PORTAL.md** for edge UX and API — not for mint authority.  
4. Implement against **component packs** and `src/`; tests and CI enforce invariants.  
5. On ambiguity, stop and ask the product owner (see root `Agents.md` process).

---

## Non-goals of this folder

- Not a substitute for Core Canon  
- Not a compliance or legal opinion  
- Not a vendor-specific prod runbook until Phase 5 deploy is ratified  

---

## Hard constraints (reminder)

- **No** Eye veto or rollback  
- **No** third-party custody  
- **No** free / privileged mint  
- **ERC = adapters only** (not SoT)  
- **Fail-closed** on gate and invariant failure  
- **NodeChain** sole economic source of truth; PoT sole value gate  

---

**Index maintained with architecture pack additions.** Keep `INSTITUTIONAL_PORTAL.md` when editing this folder.
