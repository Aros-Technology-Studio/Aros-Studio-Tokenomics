# E1 — Public hostname cutover

**Goal:** HTTPS hostname serving portal UI + same-origin or explicit edge URL.  
**Builds on:** [`DOMAIN-D8.md`](../DOMAIN-D8.md) · tunnel/proxy scripts.

---

## Paths (pick one)

| Path | When | Run |
|------|------|-----|
| **A** Cloudflare named tunnel | Domain on Cloudflare | `bash scripts/domain-tunnel-setup.sh <domain>` then `domain-tunnel-up.sh` |
| **B** Home proxy + Let's Encrypt | Public IP :80/:443 | `sudo bash scripts/domain-proxy-up.sh` |
| **C** Temporary tunnel | Demo share only | `bash scripts/home-tunnel.sh` |

Local validation first: `npm run home:up` (D1).

---

## Cutover checklist

| # | Step | Done |
|---|------|------|
| 1 | Domain registered; NS or A/CNAME controlled | |
| 2 | `AST_PUBLIC_HOST` set to bare hostname (no scheme) | |
| 3 | Path A or B completed; HTTPS loads `/login` | |
| 4 | `NEXT_PUBLIC_PORTAL_API_URL` empty (same-origin) **or** public edge URL | |
| 5 | Certificate / QR links use browser origin (no hard-coded localhost) | |
| 6 | `npm run cutover:health -- --base https://$AST_PUBLIC_HOST` PASS | |

---

## Env

| Variable | Example |
|----------|---------|
| `AST_PUBLIC_HOST` | `ast.example.com` |
| `AST_TLS_EMAIL` | `admin@example.com` (path B) |
| `AST_TUNNEL_EXTRA_HOSTS` | `www.ast.example.com` |
| `NEXT_PUBLIC_PORTAL_API_URL` | leave empty if UI rewrites `/v1` |

---

## Acceptance (engineering)

| Check | Evidence |
|-------|----------|
| Docs + scripts linked | this file · D8 · domain-*.sh |
| Health script supports public base | `scripts/cutover-health.sh` |
| Live DNS | **Owner** |

## Residual

Corporate CDN/WAF policies, multi-region anycast.
