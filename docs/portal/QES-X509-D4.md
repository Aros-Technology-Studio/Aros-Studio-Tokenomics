# D4 — X.509 / QES signature verification (edge)

**Status:** Implemented (pilot crypto path) · national QTSP residual  
**Law:** Core Canon — institution provides valuation package + qualified digital signature; system verifies authenticity.  
**Portal never mints.**

---

## 1. Problem

v1 (`institutional_attestation`) only checks:

- session institution  
- `hasQualifiedSignature: true`  
- free-text `signatureAttestation` (min 8 chars)  
- package SHA-256 hash present  

That is **not** cryptographic signature verification. D4 adds a real **X.509 detached signature** path.

---

## 2. Modes

| `mode` | Behavior |
|--------|----------|
| `institutional_attestation` (default) | v1 flag + attestation text (pilot UX) |
| `x509_detached` | Verify PEM leaf (+ optional chain) + signature over package hash against trust anchors |

Environment:

| Env | Meaning |
|-----|---------|
| `AST_X509_TRUST_DIR` | Directory of `*.pem` / `*.crt` trust anchors (preferred) |
| `AST_X509_TRUST_FILE` | Single PEM bundle (multiple certs concatenated) |
| `AST_X509_TRUST_PEMS` | Inline PEM(s) in env (dev only) |
| `AST_REQUIRE_X509=1` | Reject attestation mode; only `x509_detached` accepted |
| `AST_X509_ALLOW_SELF_SIGNED=1` | Allow leaf as its own trust anchor if no store (local demo only; never production) |

Default home stack: if trust dir `fixtures/x509-demo/trust` exists, edge may load it when env not set (dev convenience only).

---

## 3. API — `POST /v1/documents/verify-signature`

### Common

| Field | Required | Notes |
|-------|----------|--------|
| `documentPackageHash` | yes | 64 hex SHA-256 |
| `hasQualifiedSignature` | yes | must be `true` |
| `mode` | no | `institutional_attestation` \| `x509_detached` |
| `fileName` | no | audit |
| `signerId` | no | display / audit |

### Attestation mode (v1)

| Field | Required |
|-------|----------|
| `signatureAttestation` | yes (min 8 chars) |

Response `mode: "institutional_attestation"`.

### X.509 detached mode (D4)

| Field | Required | Notes |
|-------|----------|--------|
| `signerCertificatePem` | yes | Leaf certificate PEM |
| `signatureBase64` | yes | Detached signature of the **32-byte** package hash |
| `certificateChainPem` | no | Intermediate PEMs (concatenated or array) |
| `signatureAlgorithm` | no | Default auto from key type (`RSA-SHA256` / `SHA256` for EC) |

**Signed message:** raw 32 bytes of `documentPackageHash` (hex-decoded), **not** the hex string.

**Verification steps (fail-closed):**

1. Parse leaf X.509; reject if invalid PEM.  
2. Check `validFrom` ≤ now ≤ `validTo`.  
3. Build chain: leaf → intermediates → **trust anchor** (issuer match + `cert.verify(issuerPublicKey)`).  
4. Verify detached signature with leaf public key over hash bytes.  
5. Optional bind: if `AST_X509_BIND_INSTITUTION=1`, leaf subject CN or O must match session `institutionId` (case-insensitive).  

Success response includes:

```json
{
  "ok": true,
  "verified": true,
  "mode": "x509_detached",
  "verificationId": "…",
  "documentPackageHash": "…",
  "signer": {
    "subject": "…",
    "issuer": "…",
    "serialNumber": "…",
    "fingerprint256": "…",
    "notBefore": "…",
    "notAfter": "…"
  },
  "chainDepth": 2,
  "trustAnchorFingerprint256": "…"
}
```

Error codes (HTTP 422 unless noted):

| Code | When |
|------|------|
| `X509_CERT_INVALID` | Bad PEM / parse |
| `X509_CERT_EXPIRED` | Outside validity window |
| `X509_SIGNATURE_INVALID` | Signature does not verify |
| `X509_CHAIN_UNTRUSTED` | No path to trust anchor |
| `X509_TRUST_NOT_CONFIGURED` | No trust material and self-signed not allowed |
| `X509_REQUIRED` | `AST_REQUIRE_X509=1` but attestation mode used |
| `MISSING_QUALIFIED_SIGNATURE` | flag false |
| `AUTH_SESSION` | 401 |

---

## 4. Trust store (ops)

```bash
# Demo CA + leaf (repo fixtures — not production CAs)
fixtures/x509-demo/trust/demo-ca.pem
fixtures/x509-demo/leaf.pem
fixtures/x509-demo/leaf.key   # gitignored or demo-only label
```

Production: load national root/intermediate PEMs into `AST_X509_TRUST_DIR`. Do **not** enable `AST_X509_ALLOW_SELF_SIGNED`.

Generate demo material:

```bash
npm run demo:x509-package
```

---

## 5. UI

Wizard step 2:

- Default: institutional attestation (unchanged).  
- Optional advanced: paste leaf PEM + signature Base64, select **X.509 detached**.  

---

## 6. Explicit residual (not D4 Done)

| Residual | Why later |
|----------|-----------|
| Full eIDAS / national QTSP profiles | Policy + CA lists per jurisdiction |
| CMS/CAdES/PAdES embedded in PDF | Container parse beyond detached over hash |
| OCSP / CRL revocation | Network policy + caching |
| Hardware HSM signer on edge | Ops |
| Core L1 reading X.509 evidence object | Edge verificationId + flags still gate today |

Honest bar for **D4 pilot Done:** crypto path + trust anchors + tests + docs. Not “every national QES brand”.

---

## 7. Acceptance

| Check | Evidence |
|-------|----------|
| Spec written | this file |
| Detached sig verifies with good cert+sig | unit test |
| Bad sig / expired / untrusted fail-closed | unit tests |
| Attestation mode still works when not required | unit / e2e |
| Demo fixtures regenerable | `npm run demo:x509-package` |
| Track updated | `COMPLETION-TRACK.md` |

---

## 8. Related

- `docs/DEMO-PDF-E2E-D2.md` — package hash path  
- `docs/INTAKE.md` — intake flags  
- `portal/backend/src/modules/documents/x509-verify.ts`  
- Canon primary process: signature authenticity  
