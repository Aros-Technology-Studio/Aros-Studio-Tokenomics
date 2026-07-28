# Permanent domain without Cloudflare

DNS stays at **Namecheap** (or any registrar). HTTPS on the home Mac via **Caddy** + Let's Encrypt.

## Flow

```
Internet → https://your-domain (A → house public IP)
              ports 80/443
                    │
                    ▼
Home Mac  Caddy  →  :3200 Portal UI  →  :3100 Edge  →  :3000 Core
```

## Commands

```bash
bash scripts/home-up.sh
sudo bash scripts/domain-proxy-up.sh    # needs :80/:443
```

Stop: `bash scripts/home-down.sh`

## DNS (Namecheap)

| Type | Host | Value |
|------|------|--------|
| A | `@` | public IP of the house |
| A | `www` | same IP (or CNAME `www` → `@`) |

## Router

Port forward **TCP 80** and **TCP 443** → Mac LAN IP (see `ipconfig getifaddr en0`).

## Env

| Variable | Default |
|----------|---------|
| `AST_PUBLIC_DOMAIN` | `arosfinancialcore.com` |
| `AST_PUBLIC_WWW` | `www.<domain>` |
| `AST_TLS_EMAIL` | `admin@<domain>` (Let's Encrypt contact) |
| `AST_HOME_UI_URL` | `http://127.0.0.1:3200` |
