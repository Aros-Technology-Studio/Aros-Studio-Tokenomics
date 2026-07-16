# AST process documentation

**Status:** Index of runtime economic / rights processes  
**Law:** `docs/AST-CORE-CANON.md` + `docs/P0-P4-TECHNICAL-DECISIONS.md`  
**Language:** English (repository)

This directory describes **end-to-end processes** (how work flows through Orchestrator, PoT, NodeChain, and side modules). Component contracts live under `docs/components/`; this tree does **not** replace those packs.

**Defaults:** fail-closed; sole economic entry = Orchestrator; NodeChain write-ahead before economic side-effects; PoT `verified = 1` before value origin/change; Eye observe-only; no free mint, self-appraisal, third-party custody, ERC-as-SoT, staking/farming.

---

## Process index

| Document | Process | One-line purpose |
|----------|---------|------------------|
| [primary-tokenization.md](./primary-tokenization.md) | Primary tokenization | Institutional package → PoT → NodeChain → mint at official price → commission (9-step pipeline) |
| [revaluation.md](./revaluation.md) | Revaluation / value change | Confirmed institutional ΔValue → pro-rata mint or burn (§6.4, §9.10, I9) |
| [ownership-transfer.md](./ownership-transfer.md) | Ownership / rights transfer | Transfer of rights only via AST + PoT + NodeChain; traditional registry mark; fail-closed without ledger |
| [partial-release.md](./partial-release.md) | Partial release | Holder + institution; new processId; atomic burn + reserve child + remint; pre-phase internal only |
| [release-phase.md](./release-phase.md) | Release Phase | System maturity: `reserveIndex ∧ velocity`, `release_daemon`, gates I8; **not** partial-release |

---

## Shared pipeline skeleton

Most economic processes reuse the Orchestrator **9 steps**:

1. StartProcess (`processId` = `AST-{INST}-{YYYYMMDD}-` + UUIDv7, `idempotencyKey`)  
2. Documents + signature validation  
3. Oracle Gateway (if required)  
4. PoT Evaluation (P1–P4, M-of-N)  
5. NodeChain record (write-ahead)  
6. Emission / burn / token effects  
7. Settlement (commission)  
8. State update + notification  
9. EndProcess  

**Release Phase** is system/daemon + governance, not a holder StartProcess of the same kind; see [release-phase.md](./release-phase.md).

---

## Related docs

| Path | Role |
|------|------|
| `docs/AST-CORE-CANON.md` | Sole full law |
| `docs/P0-P4-TECHNICAL-DECISIONS.md` | Ratified build decisions |
| `docs/WORKFLOWS.md` | CI + runtime workflow summary |
| `docs/components/*` | Per-module PURPOSE / MODEL / CONTRACT / ACCEPTANCE |
| `docs/BUILD_SCHEDULE.md` | Phase order |

---

## Maintenance

- Keep process docs aligned with Core Canon; on conflict, **Canon wins**.  
- Do not invent free mint, Eye veto, third-party custody, ERC-as-SoT, staking/farming, or AST self-appraisal.  
- Prefer linking component packs over duplicating full contracts here.
