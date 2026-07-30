# D5–D12 — Portal finish rollup

**Date:** 2026-07-30  
**Commit track:** `docs/COMPLETION-TRACK.md`

| ID | Item | Engineering status | Owner residual |
|----|------|--------------------|----------------|
| **D5** | OCR image-only | ✅ optional `tesseract` / `AST_OCR_CMD` · `OCR-D5.md` | Install engine in prod |
| **D6** | mTLS / OIDC hooks | ✅ proxy mTLS map + HS256 OIDC pilot · `MTLS-OIDC-D6.md` | Real IdP / JWKS / TLS terminate |
| **D7** | Secrets rotation | ✅ `rotate-institution-secrets.sh` · `SECRETS-ROTATION-D7.md` | Vault / schedule |
| **D8** | Domain ops card | ✅ `DOMAIN-D8.md` + existing tunnel/proxy scripts | Live DNS cutover |
| **D9** | Showcase routes | ✅ `/showcase` `/whitepaper` `/deep-dive` `/docs` | Hosting split optional |
| **D10** | Content packs | ✅ `fixtures/content-packs/*.en.md` | RU/KA + final copy |
| **D11** | Production readiness | ✅ checklist `PRODUCTION-READINESS-D11.md` | Owner row sign-off |
| **D12** | This rollup | ✅ package complete | Close when D11 owner OK |

## Commands (quick)

```bash
# D5 — extract with OCR if tesseract installed
# POST /v1/documents/extract  (image/* or scan PDF)

# D6
# POST /v1/auth/login/mtls   (AST_MTLS_TRUST_PROXY=1 + map)
# POST /v1/auth/login/oidc   (Authorization: Bearer …)

# D7
bash scripts/rotate-institution-secrets.sh --all

# D8
# docs/DOMAIN-D8.md → tunnel or proxy

# D9/D10
# open http://127.0.0.1:3200/showcase
```

## Honest non-claims

- Not full national QTSP OCR+QES product certification  
- Not multi-region production deploy  
- Not Spring rewrite (I6 still recommended Nest)

Block **I** remains for infra product decisions.
