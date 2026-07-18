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
4. Code **last** — only after real layer/module specs exist  

Root `CANON.md` is a pointer only.

## Process (hard)

1. **Docs first** — full specs by layers and modules, visible in the tree  
2. **No freelanced code** without a written spec for that unit  
3. **No fake Done** — do not mark issues or layers complete for scaffold, README, or empty acceptance  
4. **Portal** — edge only under `portal/` (Next.js + Nest BFF + OpenAPI). Not SoT; no mint from portal.  
5. On ambiguity: ask the product owner  

## Stack (when implementation phase starts)

TypeScript / NestJS core; tests with Jest; Node ≥ 20; portal Next.js edge under `portal/`.
