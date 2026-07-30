# F4 — Field release checklist (tag / compose / GHCR)

**Status:** Ops checklist for cutting a field release after engineering A–I + F  

---

## Before tag

| # | Step | Command / note |
|---|------|----------------|
| 1 | Working tree clean on `main` | `git status` |
| 2 | Canon + tests | `npm run check:canon` · `npm test` · `npm run test:portal` |
| 3 | Release gate | `npm run check:release` |
| 4 | CHANGELOG updated | `CHANGELOG.md` |
| 5 | Version aligned | root + portal package versions if publishing |

## Tag & images

```bash
# Example field tag (owner chooses semver)
git tag -a v1.2.0 -m "Field release: A–I engineering + go-live package"
git push origin v1.2.0
# GHCR / release workflow per docs/RELEASE.md
```

## Compose field deploy

```bash
cp .env.production.example .env.production
# fill secrets — never commit
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
# optional mirror:
# docker compose -f docker-compose.prod.yml --profile with-postgres --env-file .env.production up -d
```

## After deploy

1. `/health` and `/metrics` on Core  
2. Portal `/v1/health` · login · one dry-run tokenization  
3. Backup journal volume  
4. Confirm DEMO off  

Links: [`RELEASE.md`](RELEASE.md) · [`GO-LIVE-F1.md`](GO-LIVE-F1.md)
