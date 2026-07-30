# D7 — Institution secrets rotation

**Status:** Implemented  
**Never commit** `data/institution-secrets.json` or credentials files.

## Command

```bash
# Rotate all institutions (new random salts)
bash scripts/rotate-institution-secrets.sh --all

# Rotate one id
bash scripts/rotate-institution-secrets.sh --id PILOT

# Set explicit salt
bash scripts/rotate-institution-secrets.sh --id PILOT --salt 'new-shared-secret'
```

## What happens

1. Previous JSON copied to `data/institution-secrets.rotated-<UTC>.json`  
2. New token(s) written to `data/institution-secrets.json`  
3. `data/institution-credentials.txt` refreshed  
4. **Edge must restart** to reload accounts (`home:down` / `home:up`)

## Acceptance

| Check | Evidence |
|-------|----------|
| Script exists | `scripts/rotate-institution-secrets.sh` |
| Archive previous | `data/*.rotated-*.json` (gitignored via `data/`) |
| Docs | this file + `INSTITUTION-SECRETS.md` |
