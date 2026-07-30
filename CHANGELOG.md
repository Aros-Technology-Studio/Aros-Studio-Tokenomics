# Changelog

## Unreleased — engineering finish (2026-07-30)

Repo completion blocks **A–G · E · F · I** on `main` (not a semver tag by itself).

### Nodes list + vocabulary (A8 / B5)

- Product API/UI use **nodes** / **Nodes list** for chain units — not “blocks”  
- Core: `GET /v1/core/nodechain/nodes` · Public: `GET /v1/public/nodechain/nodes`  
- Network registry remains `GET /v1/core/nodes` (participants)  
- Layer law: `docs/layers/01_NodeChain/VOCABULARY.md` · domain-invariants guard  
- Portal NodeChain explorer copy aligned with ListNodes  

### Other engineering packages

- Portal pilot finish: home-up, PDF e2e, X.509 detached, OCR, mTLS/OIDC hooks, showcase, content packs  
- Infra package: Postgres/Redis/Kafka profiles, JSON logs, K8s skeleton, `/metrics`  
- Host cutover packages (`docs/cutover/`, `cutover:env|preflight|health`)  
- Solidity Block E: ArosCoinView Foundry tests, testnet deploy, journal tip reporter; E4 free-mint out  
- Hardening Block F (Bar B): audit prep, KMS residual, mesh residual, L3 key env, `drill:backup-restore`, `monitor:smoke`  
- Docs process Block G: trackers sync, pilot brief refresh (Nodes + iMac path), B1 owner package link  
- Block H documented as **not** AST core track (outer shell, market listing, BFT mainnet, Eye veto forbid)  
- CI: `require-canon-update` ignores lockfile / dep-only noise

## 1.1.0 — 2026-07-20

**Production portal release (no demo defaults).**

### Breaking / operational
- Production (`NODE_ENV=production`) does **not** load DEMO/ACME unless `AST_ALLOW_DEMO=1`
- Real institutions: **`AST_INSTITUTION_SECRETS_JSON` only**
- Login UI: no pre-filled demo credentials
- `docker-compose.prod.yml` + `.env.production.example`

### Portal product
- Public site: about, system boundaries, explore (no auth)
- Cabinet: dashboard, tokenization, assets, history
- OpenAPI product paths: `/v1/tokenization/start`, `/v1/documents/upload`, `/v1/public/*`
- Module layout under `portal/backend/src/modules/*`

### Ops
- `scripts/release-check.sh`
- GHCR images tag `1.1.0` on `v1.1.0` release workflow

## 1.0.0 — 2026-07-19

First public release: core economic path + portal edge scaffold/product path with demo credentials for local try-out.
