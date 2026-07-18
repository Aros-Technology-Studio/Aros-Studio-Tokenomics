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
# RocksDB + Ed25519 + L1/L2/L3 pipeline
npm run demo:tokenize -- --dir data/journal-rocks --engine rocksdb
npm run cli -- journal verify --dir data/journal-rocks --engine rocksdb
```

### Hardened path

| Feature | Default |
|---------|---------|
| Journal engine | `rocksdb` (also `file`, `memory`) |
| Signatures | **Ed25519** over contentHash |
| Governance | **L1** auto → **L2** committee → **L3** 5-agent panel |
| Kill-switch | engages on chain integrity failure |
| ASE | observe/notify only |

See [`docs/HARDENING.md`](docs/HARDENING.md).

### Full layer path (no portal)

L1 → L2 → process open/encode → PoT P1–P4 → L3 AI panel → mint → commission **70/30** → reserve → close.
## Layers

See [`docs/STRUCTURE.md`](docs/STRUCTURE.md) and [`docs/layers/`](docs/layers/).  
Code under `src/nodechain`, `tx-encoding`, `processing`, `pot`, `token`, `commission`, `reserve`, `eye`, `governance`, `intake`.

## Stack

TypeScript, NestJS-ready modules, Jest, Node ≥ 20.  
Portal / Issuer UI: **out of scope**.
