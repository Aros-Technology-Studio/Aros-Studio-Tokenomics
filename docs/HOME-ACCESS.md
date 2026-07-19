# Home access — connect through your house

Run AST on your home machine and reach it from the LAN or the internet **without your own domain**.

## Architecture

```
Phone / laptop (anywhere)
        │
        │  Cloudflare quick tunnel (optional)
        ▼
Your home Mac  :3200  Portal UI  ──rewrite /v1──►  :3100 Edge  ──►  :3000 Core
        │
        └── LAN: http://192.168.x.x:3200
```

Browser talks **only to the UI origin**. `/v1/*` is proxied to the portal edge (same-origin), so one public URL is enough.

## One-time setup

```bash
cd /path/to/Aros-Studio-Tokenomics
# optional: brew install cloudflared   # for internet tunnel
```

## Start at home

```bash
bash scripts/home-up.sh
```

| Who | URL |
|-----|-----|
| You on this Mac | http://127.0.0.1:3200 |
| Phone / PC in same Wi‑Fi | http://&lt;LAN-IP&gt;:3200 (script prints it) |
| Anyone on internet | run tunnel (below) |

**Login:** `DEMO` / `demo-institution-token`

## Internet through home (no domain)

```bash
bash scripts/home-tunnel.sh
```

Gives a URL like `https://xxxx.trycloudflare.com` that terminates at **your home** UI port.

- Machine must stay on; tunnel process must run.
- Free quick tunnels are temporary (URL changes each start).
- Permanent hostname later = your domain + named Cloudflare Tunnel (optional).

## Stop

```bash
bash scripts/home-down.sh
```

## Router port-forward (alternative, no Cloudflare)

Only if you control the home router and accept opening ports:

| External | Internal | Service |
|----------|----------|---------|
| TCP 3200 | home-LAN:3200 | Portal UI only |

Then use `http://&lt;your-public-IP&gt;:3200`. **Not recommended** without TLS; prefer the tunnel.

Do **not** expose Core `:3000` or Edge `:3100` directly if UI rewrite is enough.

## Security notes (home demo)

- Demo institution tokens are for sandbox only.
- Journal data lives under `data/journal-home/` by default.
- For real institutions: new tokens, `AST_REQUIRE_INSTITUTION_AUTH=1`, named tunnel + access policy.

## Logs / PID

`.home-run/` (gitignored): `core.log`, `edge.log`, `ui.log`, `tunnel.log`, `public-url.txt`.
