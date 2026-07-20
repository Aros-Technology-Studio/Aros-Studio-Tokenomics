# Changelog

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
