# Write path

## Goal

Accept a record into the journal only when authorization, schema, and chain rules pass; then acknowledge with height.

## Steps

```text
1. Authenticate writer (mTLS / internal identity)
2. Authorize writerRole for recordType
3. Validate schema + contentHash
4. Verify signatures
5. Optional: multi-writer co-sign quorum for this append class
6. Assign height = tip+1; set prevHash = tip hash
7. Persist durably (primary store)
8. Publish event (events-out)
9. Return { height, recordId, envelopeHash }
```

## Write-ahead for other layers

Callers that cause economic or rights effects must:

1. `append` cause (or receive append from the gating layer);  
2. only then acknowledge client success.

NodeChain itself does not know “mint”; it enforces durable append before returning success on write.

## Authorization matrix (v1 baseline)

| writerRole | Typical recordTypes |
|------------|---------------------|
| `orchestrator` | process_* lifecycle |
| `pot` | pot_* |
| `emission` / `token` | mint_*, burn_*, transfer_* facts |
| `settlement` | commission_*, payment_* facts |
| `nodes` | node_register, node_suspend, … |
| `governance` | param_change |
| `system` | genesis, snapshot meta |

Exact matrix is config + allowlist; deny by default.

## Failure

On any check failure: **no height assigned**, no partial durability, error code returned (`08_api`, `failure-codes`).  
No “best effort” append.

## Idempotency

Writers should send `clientRecordId` / idempotency key.  
If the same key was already accepted, return the original `{ height, recordId }` without double-append.

## Kill-switch / read-only

If system kill-switch is on, append returns `E_READ_ONLY` (except mandatory emergency records if product law defines any — default: all appends blocked).
