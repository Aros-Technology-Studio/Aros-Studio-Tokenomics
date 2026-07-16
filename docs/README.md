# AST Documentation

**Source of truth:** [`AST-CORE-CANON.md`](./AST-CORE-CANON.md)  
**Build order:** [`BUILD_SCHEDULE.md`](./BUILD_SCHEDULE.md)  
**Decisions:** [`P0-P4-TECHNICAL-DECISIONS.md`](./P0-P4-TECHNICAL-DECISIONS.md)

All files in this tree are **English**. Product-owner chat may be Russian.

---

## Canonical tree

```
docs/
├── AST-CORE-CANON.md          # Sole full source of truth
├── ARCHITECTURE.md            # System architecture (high level)
├── ROADMAP.md                 # Phase 0 → Production
├── BUILD_SCHEDULE.md          # Build order & exit criteria
├── P0-P4-TECHNICAL-DECISIONS.md
├── processes/                 # End-to-end business processes
├── architecture/              # Context, data flow, security, deployment
├── modules/                   # Per-module deep specs
├── components/                # 4-file packs (PURPOSE/MODEL/CONTRACT/ACCEPTANCE)
├── principles/                # e.g. ANTI_POLICE
└── migration/                 # Human review checklist (legacy intake)
```

---

## Map by role

| Path | Role |
|------|------|
| `AST-CORE-CANON.md` | Full Core Canon — **only** law |
| `P0-P4-TECHNICAL-DECISIONS.md` | Ratified technical decisions |
| `BUILD_SCHEDULE.md` | Phases 0–5 execution order |
| `ARCHITECTURE.md` | End-to-end architecture |
| `ROADMAP.md` | High-level roadmap |
| `DOC_MAP.md` | Component ↔ pack ↔ code registry |
| `PORTAL.md` | Portal architecture (edge) |
| `WORKFLOWS.md` | CI + runtime flows |
| `MIGRATION_GATE.md` | Legacy doc intake gate |
| `processes/` | Business process specs |
| `architecture/` | Architecture detail |
| `modules/` | Module-level specs (README + topics + API) |
| `components/` | Implementation packs (acceptance gates) |
| `principles/ANTI_POLICE.md` | Working rule: no policing theater |

---

## Precedence

1. `AST-CORE-CANON.md`  
2. `P0-P4-TECHNICAL-DECISIONS.md`  
3. `BUILD_SCHEDULE.md`  
4. `modules/` and `components/` (must not contradict 1–2)  
5. Code last — must conform  

Root `CANON.md` is a **pointer** only.

---

## Related code

| Area | Path |
|------|------|
| Core NestJS | `src/` |
| Institutional Portal | `portal/` |
| Protective CI | `.github/` |
