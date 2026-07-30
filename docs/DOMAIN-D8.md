# D8 — Domain / public hostname (owner ops card)

**Status:** Ops package ready (scripts + docs) · live DNS is **owner action**  
**Goal:** Publish home AST stack on a real HTTPS hostname without chat help.

---

## Choose one path

| Path | When | Docs | Scripts |
|------|------|------|---------|
| **A. Cloudflare Named Tunnel** | Domain on Cloudflare; no open home ports | [`DOMAIN-TUNNEL.md`](DOMAIN-TUNNEL.md) | `domain-tunnel-setup.sh` · `domain-tunnel-up.sh` |
| **B. Home reverse proxy + Let's Encrypt** | Public IP + ports 80/443 | [`DOMAIN-HOME.md`](DOMAIN-HOME.md) | `domain-proxy-up.sh` |
| **C. Temporary tunnel** | Quick share, random URL | [`HOME-ACCESS.md`](HOME-ACCESS.md) | `home-tunnel.sh` |

Local-only (no domain): [`OWNER-START-D1.md`](OWNER-START-D1.md) · `npm run home:up`

---

## Owner checklist (permanent domain)

| # | Step | Done |
|---|------|------|
| 1 | Domain registered; DNS under your control | |
| 2 | Stack healthy locally (`npm run home:up`) | |
| 3 | Path A or B setup completed | |
| 4 | HTTPS opens UI login | |
| 5 | Certificate QR / verify uses browser origin | |
| 6 | Tokens only from secrets file (not DEMO in prod) | |

---

## Env (common)

| Variable | Role |
|----------|------|
| `AST_PUBLIC_HOST` | Canonical public hostname |
| `AST_TLS_EMAIL` | Let's Encrypt contact (path B) |
| `AST_TUNNEL_EXTRA_HOSTS` | Extra hostnames (path A) |

---

## Acceptance (D8 engineering)

| Check | Evidence |
|-------|----------|
| Owner card | this file |
| Tunnel + proxy scripts present | `scripts/domain-*.sh` |
| Linked from HOME-ACCESS / OWNER-START | yes |
| Live cutover | **Owner** — not fake Done in CI |

## Residual

- Managed multi-region CDN  
- Custom WAF policies  
- Corporate split-horizon DNS  
