# Contributing to AST

## Before you write code

1. Read [`docs/AST-CORE-CANON.md`](docs/AST-CORE-CANON.md).  
2. Read [`docs/BUILD_SCHEDULE.md`](docs/BUILD_SCHEDULE.md) — work only in the **active phase**.  
3. Read the relevant component pack under `docs/components/`.  
4. Read [`docs/P0-P4-TECHNICAL-DECISIONS.md`](docs/P0-P4-TECHNICAL-DECISIONS.md).  

If something is ambiguous: **ask the product owner**. Do not invent economics or oversight powers.

## Rules

- Fail-closed by default.  
- No PoT/NodeChain bypass.  
- All-Seeing Eye: observe/notify only (no veto/rollback/mint/burn/pay).  
- AST does not appraise assets.  
- Docs and tests before (or with) implementation in each phase step.  
- Repository language: **English**.  

## Checks before merge

```bash
npm run check:canon
npm test
npm run build
```

Architectural PRs must update `docs/AST-CORE-CANON.md` when protocol/invariants change (`require-canon-update` workflow).

## Legacy documentation

Never copy old-repo docs straight into product `docs/`. Use:

1. `migration/inbox/`  
2. `npm run check:migration`  
3. `docs/migration/REVIEW_CHECKLIST.md`  
4. Promote only as REWRITE into packs/processes  

See `docs/MIGRATION_GATE.md`.

## Agents (Grok Build)

Follow `AGENTS.md` and `.grok/rules.md`.
