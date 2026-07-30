# D11 — Production readiness checklist (pilot → prod)

**Status:** Checklist package  
**Not** a claim that production is live — owner signs each row with evidence.

---

## Security & identity

| # | Item | Evidence / env | Owner |
|---|------|----------------|-------|
| 1 | `NODE_ENV=production` | deploy | |
| 2 | `AST_ALLOW_DEMO=0` | edge env | |
| 3 | Institution secrets file or vault (not chat) | `AST_INSTITUTION_SECRETS_FILE` | |
| 4 | Tokens rotated after any share | D7 script | |
| 5 | X.509 trust anchors (not demo CA alone) | `AST_X509_TRUST_DIR` | |
| 6 | mTLS and/or OIDC plan | D6 docs · proxy config | |
| 7 | HTTPS only public URL | D8 domain | |

## Integrity & Core

| # | Item | Evidence | Owner |
|---|------|----------|-------|
| 8 | Core journal durable path + backup | `AST_JOURNAL_DIR` | |
| 9 | Kill-switch known | ops runbook | |
| 10 | Portal hand-off to Core live | health `coreHandOff` | |
| 11 | No mint on portal | architecture review | |

## Operability

| # | Item | Evidence | Owner |
|---|------|----------|-------|
| 12 | `npm run check:release` green on release tag | CI | |
| 13 | Logs retained (stdout → collector) | I4 residual | |
| 14 | Domain / tunnel monitored | D8 | |
| 15 | Showcase + portal links correct | D9/D10 | |

## Residual infra (block I) — engineering package done

See `docs/infra/BLOCK-I.md`. Live cutover still owner.  
Single go-live card: [`GO-LIVE-F1.md`](GO-LIVE-F1.md).

---

**Sign-off:** Reviewer ________ Date ________  
Reply in chat optional: **`D11 reviewed`**
