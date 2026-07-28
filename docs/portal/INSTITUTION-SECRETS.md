# Institution secrets (real login, not DEMO)

## Goal

Allowlisted institutions log into the portal with **institution id + token**.  
Tokens never go into git (`data/` is gitignored).

## Setup (local pilot)

```bash
cd /path/to/Aros-Studio-Tokenomics

# Generate secrets file + print credentials once
bash scripts/setup-institution-secrets.sh \
  --id PILOT \
  --name "Pilot Institution"

# Optional: keep DEMO alongside pilot
# bash scripts/setup-institution-secrets.sh --id PILOT --name "Pilot" --with-demo

# Start stack (auto-loads data/institution-secrets.json, AST_ALLOW_DEMO=0)
bash scripts/home-up.sh
```

| Output | Path |
|--------|------|
| Secrets JSON | `data/institution-secrets.json` |
| Human-readable creds | `data/institution-credentials.txt` |

Login: http://127.0.0.1:3200/login using the **Institution** and **Token** from the credentials file.

## Environment variables

| Variable | Role |
|----------|------|
| `AST_INSTITUTION_SECRETS_FILE` | Path to JSON array of institutions (preferred) |
| `AST_INSTITUTION_SECRETS_JSON` | Inline JSON (ok for CI; avoid long-lived shells) |
| `AST_ALLOW_DEMO` | `0` = no DEMO/ACME; `1` = allow demo accounts |

When secrets **file exists**, `home-up.sh` sets `AST_ALLOW_DEMO=0` by default.

## JSON shape

```json
[
  {
    "institutionId": "PILOT",
    "displayName": "Pilot Institution",
    "token": "long-random-hex",
    "allowlisted": true
  }
]
```

## Package a real document (after login)

1. Place PDF under `data/intake/` (gitignored) if you want a local copy.  
2. Portal UI: `/tokenization` → upload file(s) → e-sign → fields from document → start.  
3. Certificate on process page; NodeChain: `/nodechain?processId=…`

## Production notes

- Use a secrets manager / sealed file, not chat paste of tokens.  
- Rotate tokens after any leak.  
- `NODE_ENV=production` + `AST_ALLOW_DEMO=0` + secrets file required for login.  
- Later: mTLS / OIDC instead of shared token.
