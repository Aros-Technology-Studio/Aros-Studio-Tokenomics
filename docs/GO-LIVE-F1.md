# F1 — Go-live runbook (single owner card)

**Status:** Engineering package  
**Purpose:** One path from “repo ready” to “pilot live for institutions” without chat.  
**Not a claim that production is already live.**

---

## 0. Preconditions

| Check | Command / doc |
|-------|----------------|
| Repo on disk, Node ≥ 20 | `node -v` |
| Local stack works | [`OWNER-START-D1.md`](OWNER-START-D1.md) · `npm run home:up` |
| PDF path works | `npm run demo:pdf-e2e` · [`DEMO-PDF-E2E-D2.md`](DEMO-PDF-E2E-D2.md) |
| Canon / tests | `npm run check:canon` · `npm run check:release` |

---

## 1. Identity & secrets

1. Generate institution secrets (no DEMO in prod):  
   `bash scripts/setup-institution-secrets.sh --id YOURBANK --name "…" --random-salt`  
2. Store file outside chat: `data/institution-secrets.json` or vault.  
3. Rotate if ever shared: `npm run secrets:rotate -- --all` · [`SECRETS-ROTATION-D7.md`](portal/SECRETS-ROTATION-D7.md)  
4. Production: `NODE_ENV=production` · `AST_ALLOW_DEMO=0`  
5. Optional: mTLS map / OIDC · [`MTLS-OIDC-D6.md`](portal/MTLS-OIDC-D6.md)  
6. X.509 trust anchors (not demo CA alone) · [`QES-X509-D4.md`](portal/QES-X509-D4.md)

---

## 2. Hosting path (pick one)

| Path | Doc |
|------|-----|
| Local only | D1 home-up |
| Temporary public URL | [`HOME-ACCESS.md`](HOME-ACCESS.md) tunnel |
| Permanent domain | [`DOMAIN-D8.md`](DOMAIN-D8.md) · **E1** [`cutover/E1-DOMAIN.md`](cutover/E1-DOMAIN.md) |
| Docker prod compose | [`RELEASE.md`](RELEASE.md) · **E2/E3** preflight |
| Kubernetes | [`deploy/k8s/README.md`](../deploy/k8s/README.md) · **E4** |

```bash
npm run cutover:env && npm run cutover:preflight
npm run cutover:health   # after deploy
```

---

## 3. Data plane (optional, not SoT)

| Service | Enable |
|---------|--------|
| Postgres index mirror | `DATABASE_URL` · I1 |
| Redis session dual-write | `REDIS_URL` · I2 |
| Event out | `AST_EVENT_OUT_*` · I3 |
| JSON logs | `AST_LOG_JSON=1` · I4 |

Journal path must be durable + backed up (`AST_JOURNAL_DIR`).

---

## 4. Day-1 acceptance (owner)

| # | Check | Yes |
|---|--------|-----|
| 1 | HTTPS (or local) login works for real institution | |
| 2 | Document package → e-sign → start → certificate | |
| 3 | NodeChain explorer shows process nodes | |
| 4 | Portal never mints; Core health `ok` | |
| 5 | Kill-switch procedure known | |
| 6 | Metrics scrape or health monitor | `/metrics` · I7 |

Full table: [`PRODUCTION-READINESS-D11.md`](PRODUCTION-READINESS-D11.md)

---

## 5. Sign-off

| Field | Value |
|-------|--------|
| Owner | ________ |
| Date | ________ |
| Environment URL | ________ |
| Decision | Go-live / Hold |

Optional chat: **`F1 go-live`** or list blockers.
