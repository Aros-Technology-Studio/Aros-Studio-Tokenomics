# F2 — Cloud KMS / real PKCS#11

**Status:** **Later** · soft-HSM ships today  
**Code:** `src/common/crypto/key-provider.ts` · `HsmKeyProvider` (AES-GCM sealed vault)

## Today (done)

| Mode | Env |
|------|-----|
| Memory | `AST_KEY_PROVIDER=memory` |
| File keyring | `AST_KEY_PROVIDER=file` |
| Soft-HSM vault | `AST_KEY_PROVIDER=hsm` · `AST_HSM_MASTER_KEY` (64 hex) |

Soft-HSM is **not** cloud KMS and **not** PKCS#11. Same `KeyProvider` interface is the swap point.

## Target residual

| Target | Notes |
|--------|--------|
| AWS KMS / GCP KMS / Azure Key Vault | Sign digests via cloud API; no raw private key in process |
| PKCS#11 HSM | `AST_KEY_PROVIDER=pkcs11` · library path · slot/PIN from secrets |
| Key rotation ceremony | Dual-sign window · journal attestation of key id change |

## Interface contract (no freelanced rewrite)

```text
KeyProvider: sign(keyId, contentHash) → signature
             verify(sig, contentHash) → boolean
             kind: memory | file | hsm | (future kms|pkcs11)
```

## Acceptance for “F2 engineering ready”

| Check | Status |
|-------|--------|
| Soft-HSM + tests | ✅ |
| Interface documented for KMS/PKCS#11 | ✅ this file |
| Live cloud/PKCS#11 | **Owner residual** |
