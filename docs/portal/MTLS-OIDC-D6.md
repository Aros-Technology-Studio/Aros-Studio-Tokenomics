# D6 — mTLS / OIDC institution auth (pilot hooks)

**Status:** Implemented (edge hooks) · full IdP/mTLS terminate at reverse proxy residual  
**Law:** Portal is edge only; no mint. Production secrets never in git.

---

## Modes

| Mode | How | Env |
|------|-----|-----|
| Shared token (v1) | `POST /v1/auth/login` institutionId + token | secrets file / demo |
| **mTLS map** | `POST /v1/auth/login/mtls` with proxy client identity headers | `AST_MTLS_MAP_FILE` or JSON |
| **OIDC bearer** | `POST /v1/auth/login/oidc` with `Authorization: Bearer` HS256 pilot JWT | `AST_OIDC_HS_SECRET` |

### Require flags (fail-closed)

| Env | Effect |
|-----|--------|
| `AST_REQUIRE_MTLS=1` | Password login disabled; only mTLS path |
| `AST_REQUIRE_OIDC=1` | Password login disabled; only OIDC path |
| Both set | Either mTLS or OIDC accepted; password disabled |

---

## mTLS (proxy-terminated)

TLS is terminated at nginx/Caddy/Cloudflare. Edge trusts headers only when `AST_MTLS_TRUST_PROXY=1`.

| Header (first wins) | Meaning |
|---------------------|---------|
| `x-ssl-client-s-dn` | Client cert subject DN |
| `x-client-cert-subject` | Subject string |
| `x-forwarded-tls-client-cert-info` | Optional encoded info |

Map file `data/mtls-institution-map.json` (gitignored example under fixtures):

```json
[
  { "subjectContains": "CN=PILOT", "institutionId": "PILOT", "displayName": "Pilot Institution" }
]
```

Or `AST_MTLS_MAP_JSON` inline.

---

## OIDC (pilot HS256)

Production target: JWKS from issuer. Pilot hook:

- Bearer JWT signed with `AST_OIDC_HS_SECRET`
- Claims: `sub` or `institution_id` / `institutionId` must map to allowlisted institution
- Optional `aud` must match `AST_OIDC_AUDIENCE` if set
- Optional `iss` must match `AST_OIDC_ISSUER` if set

---

## Residual (not D6 Done claims)

- Live national IdP / full OIDC discovery + JWKS rotate  
- Edge-held private keys for mTLS (always proxy)  
- Hardware token binding  

---

## Acceptance

| Check | Evidence |
|-------|----------|
| Spec | this file |
| mTLS map login | unit tests |
| OIDC HS login | unit tests |
| Password blocked when require flags | unit tests |
| Docs linked from INSTITUTION-SECRETS | yes |
