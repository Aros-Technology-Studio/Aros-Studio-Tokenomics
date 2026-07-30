# AST Release v1.2.0 — Pilot-ready foundation

**Date:** 2026-07-30  
**Tag:** `v1.2.0`  
**Role:** Versioned baseline of AST for **pilot use** and for **building outer process layers on top of AST** (separate product surface — not freelanced into Core SoT).

## What this release is

- NodeChain journal SoT + PoT-gated economic path + portal institutional edge  
- Completion track A–G · E · F · I engineering packages on `main`  
- Nodes list vocabulary (not product “blocks”)  
- Operator paths: `home:up`, smoke, PDF/X.509 e2e, cutover helpers, offline restore drill  

## What this release is not

- Regulated production certification / completed external audit  
- National QTSP full path  
- Multi-node BFT mainnet  
- Outer process-shell product (that is **on** AST, track H1 later — separate from Core)  
- Public market listing of ARO  

## Pin / consume

```bash
git checkout v1.2.0
# or
git clone … && git checkout v1.2.0
```

Local pilot:

```bash
npm run home:up
# UI http://127.0.0.1:3200
```

Production-style compose (real secrets required):

```bash
cp .env.production.example .env.production
# fill secrets — never commit
npm run cutover:preflight
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

## Verify

```bash
npm test
npm run test:portal
npm run test:contracts
npm run check:canon
npm run smoke:operator
```

## Image tag convention

If GHCR workflow runs on tag: `1.2.0` / `v1.2.0` (see release workflow).

## Next after this tag

1. Outer process-layer product design **on** this baseline (not rewriting NodeChain SoT)  
2. Owner: `B1 approved` when ready  
3. Host cutover + audit engagement for regulated path  
