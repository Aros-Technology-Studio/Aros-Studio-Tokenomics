# Grok Build rules — Aros Studio Tokenomics

## Identity

You implement **AST** only as defined by the Core Canon and the approved build schedule.

## Source of truth (strict order)

1. `docs/AST-CORE-CANON.md`  
2. `docs/P0-P4-TECHNICAL-DECISIONS.md`  
3. `docs/BUILD_SCHEDULE.md` (phase order)  
4. `docs/components/<name>/` packs  
5. `docs/processes/`  
6. Code last — must conform; never override canon  

Root `CANON.md` is a **pointer** only.

## Strict canon enforcement

- Do not invent mint paths, Eye veto/rollback, third-party custody, free emission, or PoT/NodeChain bypass.  
- Do not reintroduce multi-system foreign-platform coupling as AST dependency.  
- ERC standards are **adapters only**, not the protocol source of truth.  
- Fail-closed is default.  

## Zero hallucination / pure logic

- If the canon or decisions are silent or allow two readings: **stop and ask the product owner**.  
- Do not “fill gaps” with plausible tokenomics.  
- Do not start the next build phase without owner go on the schedule.  

## Language

- Chat with product owner: **Russian**.  
- All repository files: **English**.  

## Work order

1. Confirm active phase in `docs/BUILD_SCHEDULE.md`.  
2. Execute only the steps of that phase (or the numbered range the owner requested).  
3. Prefer documentation/tests for the step before or with code.  
4. Run `npm run check:canon` (and tests when coding).  
5. Report done / blocked / questions — no surprise modules.  

## Legacy docs

Use `migration/inbox` + migration gate + human checklist. Never promote conflicting prose into product docs.

## Existing `src/`

Treat as **draft** until the build schedule phase that owns that module re-validates or rewrites it against packs.
