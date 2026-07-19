# Institutional Portal — Architecture

**Status:** v1 institutional client portal (edge)  
**Location:** `portal/`  
**Role:** Login, package admission, Core hand-off. **Not** NodeChain SoT.

## Boundary (Core Canon)

| Portal **may** | Portal **must not** |
|----------------|---------------------|
| Authenticate allowlisted institutions | Appraise assets |
| Collect valuation + document hash + signature attestation | Mint / burn / transfer ARO |
| Call Core Orchestrator | Hold third-party funds |
| Show process status | All-Seeing Eye veto / rollback |

## User journeys

1. **Login** → session (`X-Session-Id`) bound to institution + token  
2. **Dashboard** → list edge-tracked processes for that institution  
3. **New process** → hash documents → submit primary tokenization  
4. **Status** → merge edge record + Core `/v1/core/processes/:id`  

## Stack

```
Browser (Next.js :3200)
    → Portal BFF (Nest :3100)  auth + validation + hash
        → Core (Nest :3000)    Orchestrator sole economic entry
            → NodeChain SoT
```

## Security (v1)

- Shared institution tokens (env / `AST_INSTITUTION_SECRETS_JSON`)  
- Session TTL 8h in-memory (restart invalidates)  
- Session institution overrides spoofed `X-Institution-Id`  
- Optional Core `AST_REQUIRE_INSTITUTION_AUTH=1` for token on core writes  
- Production follow-on: mTLS, OIDC, full X.509 chain for КЭП  

## processId / idempotency

Aligned with Orchestrator: `AST-{INST}-{YYYYMMDD}-{suffix}`; mandatory `Idempotency-Key`.
