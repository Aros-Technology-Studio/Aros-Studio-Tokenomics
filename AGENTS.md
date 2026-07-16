# Agent instructions — Aros Studio Tokenomics (AST)

## Language

| Context | Language |
|---------|----------|
| Chat / conversation with the product owner | **Russian** |
| Everything written into this repository | **English** |

## Source of truth

1. **`docs/AST-CORE-CANON.md`** — full Core Canon (sole law)  
2. **`docs/P0-P4-TECHNICAL-DECISIONS.md`** — ratified decisions  
3. **`docs/BUILD_SCHEDULE.md`** — phase order  
4. **`docs/components/`** — packs  
5. Code last  

Root `CANON.md` is a pointer only.

## Process

- Follow `.grok/rules.md`  
- Work only within the active build phase unless the owner expands the range  
- On ambiguity: ask the product owner  
- Migration: `docs/MIGRATION_GATE.md`  

## Stack (reminder)

TypeScript / NestJS core; tests with Jest; Node ≥ 20; portal Next.js edge under `portal/`.
