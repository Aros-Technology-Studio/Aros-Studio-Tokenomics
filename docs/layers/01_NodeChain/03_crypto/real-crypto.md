# Real crypto (Ed25519)

**Code:** `src/common/crypto/ed25519.ts`, `key-registry.ts`, `bootstrap-keys.ts`

## Rules

1. Default pipeline uses **Ed25519** signatures over `contentHash` (hex).  
2. Algorithm id on record: `ed25519`.  
3. Only `ed25519` signatures accepted.  
4. Writers auto-sign when KeyRegistry holds their private key.  
5. Append verifies all signatures before durability.

## Key ids (bootstrap)

`system`, `orchestrator`, `pot`, `token`, `settlement`, `governance`, `v1`, `v2`, `v3`

Production: load keys from HSM/KMS; same `KeyRegistry` interface.
