# Record schema

## Canonical encoding

- Payload is encoded in a **canonical** form (deterministic key order, no insignificant whitespace if JSON; or binary schema with fixed field order).  
- `contentHash = H(canonical_payload_bytes ‖ recordType ‖ processId ‖ schemaVersion)`.  
- Exact hash function: see `03_crypto/algorithms.md` (default SHA-256 for v1 unless upgraded).

## Common header (all records)

```text
recordId          string   required
schemaVersion     string   required   e.g. "nc-record-1"
recordType        string   required
processId         string   optional   required for process-scoped types
writerId          string   required
writerRole        string   required
timestampUtc      string   required   ISO-8601 UTC
prevHash          string   required   hex
contentHash       string   required   hex
height            u64      assigned by ledger on accept
payload           object   required   may be empty object
signatures[]      object   required   at least one
```

### Signature object

```text
signerId          string
algorithm         string
signature         bytes/hex
signedOver        "contentHash" | "envelope-v1"
```

## Payload conventions

1. Money amounts: decimal strings with fixed scale (9 for ARO) where present — NodeChain stores, does not compute fees.  
2. No free-form secrets in payload; use commitments when needed.  
3. Large blobs: store **hash + locator** (or encrypted blob id), not megabytes of documents inline unless policy allows.  
4. Foreign keys to other systems: opaque ids + content hash of external evidence.

## Schema evolution

- Additive optional fields: allowed with `schemaVersion` bump or compatible minor.  
- Removing/renaming fields: new `recordType` or major schema version; old records remain readable.  
- Readers must ignore unknown optional fields (forward compatible).

## Validation on append

Reject (`E_SCHEMA`, fail-closed) if:

- required header fields missing;  
- `recordType` unknown;  
- process-scoped type without `processId`;  
- payload fails type schema;  
- `contentHash` mismatch;  
- signatures invalid.
