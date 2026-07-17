# Aros Studio Tokenomics (AST)

## Status: CLEAN SLATE

Implementation scaffold, portal, pseudo-complete module/component docs, and freelanced code were **removed**.

Work restarts **docs-first**: Core Canon → layer/module specifications → then code.  
Portal is **last**, not first.

## Source of truth (kept)

| Path | Role |
|------|------|
| [`docs/AST-CORE-CANON.md`](docs/AST-CORE-CANON.md) | Sole law (I1–I9, PoT, Eye, token protocol) |
| [`docs/P0-P4-TECHNICAL-DECISIONS.md`](docs/P0-P4-TECHNICAL-DECISIONS.md) | Ratified technical decisions (owner Q&A) |
| [`docs/BUILD_SCHEDULE.md`](docs/BUILD_SCHEDULE.md) | Work order (owner) |
| [`AGENTS.md`](AGENTS.md) | Agent language/process rules |
| [`CANON.md`](CANON.md) | Pointer to Core Canon |

## Not present (intentionally)

- `src/` — no core code  
- `portal/` — no portal  
- `docs/modules/`, `docs/components/` — no fake complete specs  
- CI, Docker, packages — removed with scaffold  

## Rebuild order (mandatory)

1. Documentation tree by **layers** and **modules** (real specs, not stubs)  
2. Acceptance criteria per layer  
3. Core implementation against those specs  
4. Tests on core  
5. Core API  
6. Portal (last)
