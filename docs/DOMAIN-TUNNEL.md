# Permanent domain via Cloudflare Named Tunnel

Publish the home AST stack at **your domain** (HTTPS, fixed hostname).  
No open router ports. No temporary `*.trycloudflare.com` URLs.

## What “ready” means

| Side | Ready when |
|------|------------|
| **AST code** | Core + edge + UI work; browser uses same-origin `/v1/*` (rewrites). **Done.** |
| **This Mac** | `home-up` stack runs; `cloudflared` binary available. **Done in repo scripts.** |
| **Your domain** | Registered (e.g. `arosfinancialcore.com`). |
| **Cloudflare** | Domain is a zone in **your** Cloudflare account; nameservers at the registrar are Cloudflare; zone status **Active**. |
| **One login** | On this Mac: browser opens once → authorize `cloudflared` for that zone. |

If the domain still has an **A record to the home public IP** (e.g. `46.x.x.x`) only, that is *not* the named tunnel yet. Setup replaces / adds **CNAME → tunnel** (Proxied).

## Architecture

```
Internet  →  https://arosfinancialcore.com  (Cloudflare edge + TLS)
                │
                │  named tunnel (encrypted)
                ▼
Home Mac  :3200  Portal UI  ──/v1 rewrite──►  :3100 Edge  ──►  :3000 Core
```

Only the UI port is published through the tunnel. Core and edge stay local.

## Current domain status (check before setup)

As of last check, `arosfinancialcore.com`:

| Item | Value |
|------|--------|
| A record | `46.196.80.100` (home public IP) |
| Nameservers | `pdns1.registrar-servers.com` / `pdns2…` (**Namecheap**, not Cloudflare yet) |

Named tunnel DNS automation needs the zone on **Cloudflare**. Until NS move, `domain-tunnel-setup` login/route will fail or cannot manage records.

## One-time setup

1. **Cloudflare Dashboard** → Add site → `arosfinancialcore.com` (Free plan is enough).  
2. At **Namecheap** → Domain List → Manage → Nameservers → **Custom DNS** → paste the two Cloudflare NS Cloudflare shows you.  
3. Wait until Cloudflare shows zone status **Active** (often 5–30 min, sometimes up to 24h).  
4. On this Mac:

```bash
cd /path/to/Aros-Studio-Tokenomics
bash scripts/domain-tunnel-setup.sh arosfinancialcore.com
```

Browser opens for Cloudflare login — pick the zone that owns the domain.  
Script creates tunnel `ast-portal`, writes `~/.cloudflared/config.yml`, routes DNS for apex + `www`.

## Every start

```bash
bash scripts/home-up.sh
bash scripts/domain-tunnel-up.sh
```

| Who | URL |
|-----|-----|
| Public | https://arosfinancialcore.com |
| www | https://www.arosfinancialcore.com |
| Local | http://127.0.0.1:3200 |
| Login | `pilot` / salt `pilot` |

## Stop

```bash
bash scripts/home-down.sh
```

## Env overrides

| Variable | Default | Meaning |
|----------|---------|---------|
| `AST_PUBLIC_DOMAIN` | `arosfinancialcore.com` | Apex hostname |
| `AST_TUNNEL_NAME` | `ast-portal` | Tunnel name in Cloudflare |
| `AST_TUNNEL_EXTRA_HOSTS` | `www.<domain>` | Extra hostnames |
| `AST_HOME_UI_URL` | `http://127.0.0.1:3200` | Local service for ingress |

## Temporary tunnel (no domain)

```bash
bash scripts/home-tunnel.sh   # https://….trycloudflare.com — URL changes each time
```

Use **domain-tunnel-*** for production-looking permanent hostname.

## Ops notes

- Mac must stay **on**; tunnel process must run (logs: `.home-run/tunnel.log`).
- Credentials: `~/.cloudflared/*.json` and `cert.pem` — **never commit**.
- Certificate QR / verify URLs use the browser origin → automatic on the real domain.
- For hard production later: VPS/Docker + same tunnel or full Cloudflare Workers; this home path is intentional for pilot.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Login never finishes | Domain not in this Cloudflare account / wrong zone selected |
| `route dns` fails | Zone not Active; fix NS at registrar |
| 502 Bad Gateway | `home-up` not running; check `:3200` |
| Old site / wrong IP | Delete leftover A records; keep tunnel CNAME Proxied |
| Tunnel exits | `tail -f .home-run/tunnel.log` |
