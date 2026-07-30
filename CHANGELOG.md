# Changelog

## 1.2.0 — 2026-07-30

**Pilot-ready foundation release** after completion track A–G · E · F · I.  
Suitable as a **versioned dependency for outer process-layer work** that sits *on* AST (not inside Core SoT). Portal still never mints. Not a claim of regulated production audit.

### Nodes list + vocabulary (A8 / B5)

- Product API/UI use **nodes** / **Nodes list** for chain units — not “blocks”
- Core: `GET /v1/core/nodechain/nodes` · Public: `GET /v1/public/nodechain/nodes`
- Network registry remains `GET /v1/core/nodes` (participants)
- Layer law: `docs/layers/01_NodeChain/VOCABULARY.md` · domain-invariants guard

### Portal pilot finish (D)

- Owner alone start: `npm run home:up` / READY card
- Document-first e2e: `demo:pdf-e2e`
- X.509 detached verify + demo e2e; OCR assist; mTLS/OIDC pilot hooks
- Secrets rotation, domain ops card, showcase + content packs

### Infrastructure & cutover (I + ops)

- Postgres / Redis / Kafka compose profiles; JSON logs; K8s skeleton; `/metrics`
- Cutover helpers: `cutover:env`, `cutover:preflight`, `cutover:health`

### Solidity representation (E)

- ArosCoinView Foundry tests; testnet deploy + journal tip reporter
- Free mint / ERC-as-SoT explicitly out

### Hardening Bar B packages (F)

- Audit prep, soft-HSM + KMS residual docs, mesh residual, L3 key env
- Offline drill: `drill:backup-restore` · monitor smoke: `monitor:smoke`

### Process & scope (G · H)

- Trackers and pilot brief synchronized
- Block H: outer process shell / market listing / BFT mainnet / Eye veto — **not** AST core track

### CI

- `require-canon-update` ignores lockfile / dep-only noise

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
