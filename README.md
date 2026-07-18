# Aros Studio Tokenomics (AST)

Institutional process token-economy: **NodeChain** is the sole source-of-truth journal; value gates through **PoT**; AST holds only its own funds.

## Status

| Area | State |
|------|--------|
| Canon | `docs/AST-CORE-CANON.md` |
| Layer specs | `docs/layers/01_NodeChain` full draft; 02–10 skeletons |
| Code | **NodeChain journal live** — genesis + first record |
| Portal | **Edge scaffold** (`portal/`) — not SoT |

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
| All-Seeing Eye | observe/notify only |

See [`docs/HARDENING.md`](docs/HARDENING.md).  
**Next (tracked):** HSM keys · journal replication · L3 LLM adapters — [`docs/BACKLOG.md`](docs/BACKLOG.md) · issues #68 #69 #70.

### Full layer path

L1 → L2 → process open/encode → PoT P1–P4 → L3 AI panel → mint → commission **70/30** → reserve → close.

### Institutional Portal (edge)

Scaffold: Next.js + Nest BFF + shared + OpenAPI under [`portal/`](portal/).  
Architecture: [`docs/portal/ARCHITECTURE.md`](docs/portal/ARCHITECTURE.md).  
Requires institutional valuation + qualified signature; **no mint** from portal.

```bash
cd portal/shared && npm i && npm test
cd ../backend && npm i && npm test && npm run start:dev
# separate terminal
cd portal/frontend && npm i && npm run dev
```

## Layers

See [`docs/STRUCTURE.md`](docs/STRUCTURE.md) and [`docs/layers/`](docs/layers/).  
Code under `src/nodechain`, `tx-encoding`, `processing`, `pot`, `token`, `commission`, `reserve`, `all-seeing-eye`, `governance`, `intake`.  
Portal edge under `portal/{shared,backend,frontend}`.

## Stack

TypeScript, NestJS core + portal Nest edge, Next.js portal UI, Jest, Node ≥ 20.
