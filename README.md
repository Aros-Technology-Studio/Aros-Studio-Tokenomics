# Aros Studio Tokenomics (AST)

Self-sufficient institutional tokenization platform: **NodeChain**, **Proof-of-Transaction (PoT)**, **ArosCoin**, reserves, settlement, and observe-only **All-Seeing Eye**.

## Source of truth

| Document | Role |
|----------|------|
| [`docs/AST-CORE-CANON.md`](docs/AST-CORE-CANON.md) | **Core Canon** (sole full SoT) |
| [`docs/P0-P4-TECHNICAL-DECISIONS.md`](docs/P0-P4-TECHNICAL-DECISIONS.md) | Ratified technical decisions |
| [`docs/BUILD_SCHEDULE.md`](docs/BUILD_SCHEDULE.md) | Build order (phases 0–5) |
| [`CANON.md`](CANON.md) | Root pointer to Core Canon |

## Quick links

- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
- Portal: [`docs/PORTAL.md`](docs/PORTAL.md)  
- Component packs: [`docs/components/`](docs/components/)  
- Workflows (CI + runtime): [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md)  
- Migration gate: [`docs/MIGRATION_GATE.md`](docs/MIGRATION_GATE.md)  
- Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md)  

## Status

**Phase 0 — Foundation.** Protective CI is active. Implementation follows the build schedule **after** foundation exit — not ad hoc.

## Development

```bash
# Product guards (canon, philosophy, packs, layout, …)
npm run check:canon

# Candidate docs before promote from legacy
npm run check:migration

npm test
npm run build
```

Core API (when running): default port `3000`, prefix `/v1`.  
Portal edge: `portal/` (Next.js + Nest), talks to core via `CORE_API_URL`.

## Layout (aliases)

| Path | Role |
|------|------|
| `docs/` | Canon, decisions, architecture, packs, processes |
| `src/` | Core NestJS modules (draft until phase execution) |
| `portal/` | Institutional portal edge |
| `nodechain/`, `pot-engine/`, `aroscoin/` | Layout aliases + README |
| `migration/` | Inbox for legacy doc candidates |
| `.github/` | CI + protective workflows |

## Language

- Repository: **English**  
- Product owner chat: **Russian** (see `AGENTS.md`)
