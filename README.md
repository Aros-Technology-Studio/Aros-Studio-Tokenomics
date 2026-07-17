# Aros Studio Tokenomics (AST)

Institutional process token-economy: **NodeChain** is the sole source-of-truth journal; value gates through **PoT**; AST holds only its own funds.

## Status

| Area | State |
|------|--------|
| Canon | `docs/AST-CORE-CANON.md` |
| Layer specs | `docs/layers/01_NodeChain` full draft; 02–10 skeletons |
| Code | **NodeChain journal live** — genesis + first record |
| Portal | **Out of scope** |

## First journal record

```bash
npm install
npm test
npm run journal:first -- --dir data/journal
npm run cli -- journal dump --dir data/journal
```

- Height **0** = `genesis`  
- Height **1** = `system_boot` (first operational append)  
- Chain verified via `npm run cli -- journal verify --dir data/journal`

## Layers

See [`docs/STRUCTURE.md`](docs/STRUCTURE.md) and [`docs/layers/`](docs/layers/).

## Stack

TypeScript, NestJS modules, Jest, Node ≥ 20.  
Issue titles on GitHub are the backlog map for layers 01–10 and ENV work.
