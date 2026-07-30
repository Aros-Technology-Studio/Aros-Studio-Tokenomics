# Encryption at rest

## Requirement

Primary journal storage uses **encryption at rest** (volume or application-level).  
v1: required for durable engines (P0–P4 / B2).

## What is stored

| Data | At rest |
|------|---------|
| Journal records | Encrypted store (file JSONL / RocksDB values) |
| Tip / client idempotency maps | Encrypted with same key (file store) |
| Signing key material | HSM/file KeyProvider — never in git |
| At-rest master key | `at-rest.key` in journal dir or env — never in git |

## Application-level (shipped)

| Item | Detail |
|------|--------|
| Algorithm | AES-256-GCM |
| Envelope | `{ v:1, alg:"aes-256-gcm", iv, tag, data }` (hex fields) |
| Engines | **file** and **rocksdb** when `AST_JOURNAL_ENCRYPT` is on (default **1**) |
| Memory | Plaintext (ephemeral tests) |
| Key | `AST_JOURNAL_AT_REST_KEY` (hex) **or** auto `AST_JOURNAL_DIR/at-rest.key` (0600) |
| Disable | `AST_JOURNAL_ENCRYPT=0` (dev only; not for pilot/prod) |
| Legacy | Plaintext JSON lines still load (migration); new writes are sealed |

Code: `src/common/crypto/at-rest.ts` · wired in `FileJournalStore` / `RocksDbJournalStore` via `createNodechainAsync`.

## Ops

```bash
# default: encrypt durable journal
export AST_JOURNAL_ENGINE=file
export AST_JOURNAL_DIR=data/journal-pilot
# optional explicit key (else auto-created under journal dir):
# export AST_JOURNAL_AT_REST_KEY=$(openssl rand -hex 32)

npm run journal:first -- --dir "$AST_JOURNAL_DIR" --engine file
# journal.jsonl lines must not contain raw payload strings
```

**Backup:** copy journal dir **including** `at-rest.key` (or restore env key). Losing the key loses readability of ciphertext (hash-chain still integrity-bound in sealed blobs once decrypted).

## Not in v1 core

Per-field multi-node “no one sees full tx” sharding mesh — optional future privacy package, not required for SoT ledger.
