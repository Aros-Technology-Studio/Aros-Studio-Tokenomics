# Changelog

All notable changes to **Aros Studio Tokenomics** are documented in this file.  
Format inspired by Keep a Changelog. Repository language: English.

## [Unreleased]

### Added

- Full documentation tree: `docs/modules/*`, `docs/processes/*`, `docs/architecture/*`
- Mermaid `DIAGRAM.md` for each component pack and module
- `rules/AST_RULES.yaml` — machine-readable invariants and ship defaults
- `docs/INTAKE.md` — institutional intake and signature verification
- `docs/LEGAL_STATUS.md` — regulatory verification checklist
- Postgres index schema SQL under `docs/db/`
- Solidity representation adapter scaffold under `contracts/`
- Governance L1 hierarchy notes and service expansion
- Migration completion reports under `migration/reports/`

### Changed

- Component packs for P4 support modules expanded to full PURPOSE/MODEL/CONTRACT/ACCEPTANCE
- Commission ship default confirmed **70% nodes / 30% AST** (Core Canon §XII)
- All-Seeing Eye titles and docs: observe/notify only (no veto)

## [0.1.0] — 2026-07-16

### Added

- Core Canon v1.0 Final (`docs/AST-CORE-CANON.md`)
- P0–P4 technical decisions and build schedule
- NestJS core modules: nodechain, pot, emission, aroscoin, commission, orchestrator, reserve, eye, release stack, portal edge
- Protective GitHub Actions and `npm run check:canon`
- Jest unit + e2e tokenize flow
- CLI `npm run cli tokenize`
