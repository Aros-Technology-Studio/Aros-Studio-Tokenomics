# Home access — connect through your house

Run AST on your home machine and reach it from the LAN or the internet.

**Owner start alone (D1):** short card → [`OWNER-START-D1.md`](OWNER-START-D1.md)

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

Browser talks **only to the UI origin**. `/v1/*` is proxied to the portal edge (same-origin).

## Start at home

```bash
cd /path/to/Aros-Studio-Tokenomics
bash scripts/home-up.sh
# npm run home:up
```

| Who | URL |
|-----|-----|
| This Mac | http://127.0.0.1:3200 |
| Same Wi‑Fi | http://&lt;LAN-IP&gt;:3200 (script prints it) |
| Internet | `bash scripts/home-tunnel.sh` |

**Login (local demo):** `pilot` / `pilot`  
**Alt:** DEMO / `demo-institution-token`  
**Wizard:** http://127.0.0.1:3200/tokenization  

`home-up.sh`:

- Checks Node ≥ 20  
- Installs deps if missing  
- Builds Core  
- Starts Core · edge · UI  
- Waits for health (prints log tail on failure)  
- Writes `.home-run/READY.txt`  

Journal: `data/journal-pilot/` · Edge store: `data/edge-processes.json`  
Secrets: [`docs/portal/INSTITUTION-SECRETS.md`](portal/INSTITUTION-SECRETS.md)

## Stop

```bash
bash scripts/home-down.sh
# npm run home:down
```

## Internet tunnel (no domain)

```bash
bash scripts/home-tunnel.sh
cat .home-run/public-url.txt
```

Machine must stay on; free tunnel URL changes each start.

## Permanent domain

See [`DOMAIN-TUNNEL.md`](DOMAIN-TUNNEL.md).

## Logs / PID

`.home-run/` (gitignored): `core.log`, `edge.log`, `ui.log`, `READY.txt`, `public-url.txt`.
