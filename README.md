# Aros Studio Tokenomics (AST)

Institutional process token-economy: **NodeChain** is the sole source-of-truth journal; value gates through **PoT**; AST holds only its own funds.

## Status

| Area | State |
|------|--------|
| Canon | `docs/AST-CORE-CANON.md` |
| Layer specs | `docs/layers/01_NodeChain` full draft; 02–10 skeletons |
| Code | **NodeChain journal live** — genesis + first record |
| Portal | **Out of scope** |

## Quick start

```bash
npm install
npm test
npm run journal:first -- --dir data/journal
npm run demo:tokenize -- --dir data/journal
npm run cli -- journal dump --dir data/journal
```

### Journal

- Height **0** = `genesis`  
- Height **1+** = process / pot / mint / commission facts after demo  

### Full layer path (no portal)

`demo:tokenize` runs layers **01–10** core path:

L1 governance → process open/encode → PoT P1–P4 → mint → commission **70/30** → reserve → close  
ASE **observes** (no veto). Everything significant is on NodeChain.

## Layers

See [`docs/STRUCTURE.md`](docs/STRUCTURE.md) and [`docs/layers/`](docs/layers/).  
Code under `src/nodechain`, `tx-encoding`, `processing`, `pot`, `token`, `commission`, `reserve`, `eye`, `governance`, `intake`.

## Stack

TypeScript, NestJS-ready modules, Jest, Node ≥ 20.  
Portal / Issuer UI: **out of scope**.
