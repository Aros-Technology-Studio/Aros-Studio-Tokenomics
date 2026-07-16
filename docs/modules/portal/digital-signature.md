# Portal — digital signature (КЭП)

**Canon:** Core Canon §5.2 (document package + qualified digital signature)  
**Decisions:** P1 nodes — cert (КЭП/X.509) + key pair; allowlist  
**Architecture:** `docs/architecture/INSTITUTIONAL_PORTAL.md`  
**Frontend crypto:** `portal/frontend/lib/crypto.ts`

---

## Rule

**Qualified electronic signature (КЭП) is mandatory on document upload** for primary tokenization and any process path that requires institutional package authenticity.

| Without valid КЭП | Effect |
|-------------------|--------|
| Upload | **Reject** |
| Process | Remains `documents_pending` (or fails validation) |
| PoT | Cannot satisfy criteria path (P1 context + package authenticity) |
| Emission | Must not proceed |

There is no “unsigned upload for convenience” mode in prod.

---

## What is signed

Institution provides a **document package** containing:

- Official asset valuation (institution-authored)  
- Supporting documents required by process type  
- Qualified signature binding package authenticity to the institutional identity  

AST verifies **authenticity of signature and documents**; AST does **not** re-appraise the asset (Canon §5.1–5.2).

---

## Verification layers

| Layer | Responsibility |
|-------|----------------|
| Browser / Web Crypto | Local pre-check UX; prepare signature payload |
| Portal API | Mandatory verify on `POST /documents/upload`; reject invalid |
| Process / nodes cert path | Institutional certificate on allowlist; mTLS identity |
| PoT P1 | Allowed architectural context (valid cert + allowlist) |

Local verify is necessary but not sufficient; core process rules still apply.

---

## Upload contract (edge)

`POST /v1/documents/upload` (multipart):

| Part | Required | Notes |
|------|----------|-------|
| `file` | yes | Document binary |
| `processId` | yes | Existing process from StartProcess |
| `signature` | yes | Base64-encoded qualified electronic signature |
| `signatureAlgorithm` | no | Algorithm identifier |

Responses:

| Code | Meaning |
|------|---------|
| 200 | Document accepted for validation pipeline |
| 400 | Invalid signature or payload |
| 422 | Rejected by validation rules |

---

## Certificate identity

| Concept | Role |
|---------|------|
| Institutional X.509 / КЭП cert | Identity of participant |
| Allowlist + manual approval | Nodes / institutions onboarding |
| Multi-node same institution | **1 vote total** per institutional certificate (PoT) |

Portal profile screens surface certificate metadata for operators; they do not replace allowlist governance.

---

## Algorithms and formats

v1 integration uses:

- Web Crypto API in the browser where applicable  
- Server-side verification of signature bytes against institutional public material  
- Algorithm field for agility (RSA-PSS, GOST family, etc. per deployment jurisdiction)

Exact crypto profile is deployment config; **requirement of qualified signature is not optional**.

---

## Failures and user messaging

| Failure | Operator-facing guidance |
|---------|--------------------------|
| Missing signature | Attach qualified signature before upload |
| Bad signature | Check cert, payload bytes, algorithm |
| Expired cert | Renew institutional certificate |
| Cert not allowlisted | Contact AST onboarding / governance |
| Process not owned | Cannot attach docs to foreign processId |

---

## Explicit non-goals

- Portal does not generate institutional valuation “and then sign as AST”  
- Portal does not accept employee personal signatures as substitute where institutional КЭП is required  
- Eye does not “approve” signatures  

---

## Checklist

- [x] КЭП required on document upload  
- [x] Invalid/missing → document not accepted  
- [x] Aligns with Canon §5.2 and PoT P1 context  
- [x] Not a valuation invention path  
