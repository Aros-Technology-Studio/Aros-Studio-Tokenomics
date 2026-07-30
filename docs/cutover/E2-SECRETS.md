# E2 — Production secrets bootstrap

**Goal:** Real institution credentials in production mode; no DEMO; no secrets in git.  
**Builds on:** D7 rotation · `docs/portal/INSTITUTION-SECRETS.md` · `.env.production.example`

---

## Bootstrap

```bash
# 1) Create / rotate institution file (gitignored under data/)
bash scripts/setup-institution-secrets.sh --id YOURBANK --name "Your Bank" --random-salt
# or: npm run secrets:rotate -- --all

# 2) Materialize .env.production from template + secrets file (never commit)
npm run cutover:env
# writes .env.production (gitignored) — review before use

# 3) Preflight — fails if demo on, placeholder tokens, missing NODE_ENV=production
npm run cutover:preflight
```

---

## Required production flags

| Variable | Production value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `AST_ALLOW_DEMO` | `0` |
| `AST_REQUIRE_INSTITUTION_AUTH` | `1` |
| `AST_INSTITUTION_SECRETS_JSON` or file load | real allowlisted institutions |
| `AST_INSTITUTION_TOKEN` | non-placeholder core shared secret |
| `KILL_SWITCH` | `false` unless emergency |

Forbidden placeholders (preflight rejects): `change-me`, `YOURBANK` left as-is with demo token patterns, `demo-institution-token` when `AST_ALLOW_DEMO=0`.

---

## Checklist

| # | Step | Done |
|---|------|------|
| 1 | Secrets only in vault / `.env.production` / `data/*` (gitignored) | |
| 2 | `npm run cutover:preflight` exit 0 | |
| 3 | Login with real institution (not pilot demo) on target host | |
| 4 | Rotation procedure known (D7) | |
| 5 | Optional mTLS/OIDC plan documented (D6) | |

---

## Acceptance

| Check | Evidence |
|-------|----------|
| `cutover:env` + `cutover:preflight` scripts | `scripts/cutover-*.sh` |
| Expanded `.env.production.example` | root |
| Live secrets | **Owner** |
