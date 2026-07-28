# Append API

## Logical RPC

```text
Append(request) → AppendResult | Error
```

### Request

```text
clientRecordId    string   optional idempotency key
recordType        string   required
processId         string   optional/required by type
payload           object   required
schemaVersion     string   required
contentHash       string   required
signatures[]      object   required
```

### Result

```text
recordId          string
height            u64
envelopeHash      string
timestampUtc      string
```

## Semantics

- Success ⇒ durable on primary, chain linked, events emitted.  
- Idempotent replay of same `clientRecordId` + same body ⇒ same result.  
- Errors: see failure-codes; HTTP/gRPC mapping is implementation detail.

## Auth

mTLS or internal service identity mandatory.

## HTTP note (v1)

Open HTTP append is **not** exposed on core Nest. Writers are in-process services
(`OrchestratorService`, PoT, token, …) calling `NodechainService.append`.  
Idempotent genesis only: `POST /v1/core/nodechain/genesis` (see `ASSEMBLY.md`).