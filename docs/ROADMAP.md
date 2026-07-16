# AST Roadmap

**Status:** Canonical outline  
**Schedule detail:** `docs/BUILD_SCHEDULE.md`  
**Canon:** `docs/AST-CORE-CANON.md`

---

## Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| **0** | Foundation | Canon, structure, protective CI, agent rules | Complete |
| **1** | Core Ledger & Validation | NodeChain + PoT (write-ahead) | Complete (core path) |
| **2** | Token & Emission | ArosCoin + emission + settlement | Complete (core path) |
| **3** | Orchestration & Portal | Orchestrator + institutional portal E2E | Complete (core path + edge wire) |
| **4** | Governance & Release | Eye, reputation, Release Phase, partial-release, oracle | Complete (core path) |
| **5** | Hardening & Production | External audit, prod deploy, monitoring, polish | Partial |

---

## Documentation tree (target)

See `docs/README.md` for the full layout:

- **Canon & decisions** — `AST-CORE-CANON.md`, `P0-P4-TECHNICAL-DECISIONS.md`
- **Architecture** — `ARCHITECTURE.md` + `docs/architecture/*`
- **Processes** — `docs/processes/*`
- **Modules** — `docs/modules/*` (detailed module specs)
- **Component packs** — `docs/components/*` (PURPOSE/MODEL/CONTRACT/ACCEPTANCE; still valid for implementation gates)

If any document conflicts with Core Canon, **Core Canon wins**.

---

## Production (Phase 5 remaining)

- Full external security audit (human/org)
- Production deploy pipeline (infra TBD)
- Monitoring stack (ops TBD)
- Optional native RocksDB; portal UI polish

---

## Non-goals (v1)

- Service mesh / Cilium as architecture truth  
- Retail trading UI as core product  
- Dual canons or foreign multi-system coupling as AST dependency  
- Eye veto / rollback  
- Third-party fund custody  
- Free mint, pre-mine, staking, and farming are forbidden