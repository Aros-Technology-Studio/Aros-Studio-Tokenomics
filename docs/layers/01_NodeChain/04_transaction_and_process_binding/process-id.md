# processId

## Role

`processId` binds journal records to one AST process instance (tokenization, revaluation, transfer, …).

## Format (v1 recommendation)

```text
AST-{INST}-{YYYYMMDD}-{suffix}
```

- `INST` — institution code  
- date — UTC calendar date of open  
- suffix — UUIDv7 or monotonic unique  

Exact pattern may follow orchestrator pack; NodeChain treats `processId` as opaque string with uniqueness.

## Uniqueness

One live process identity must not be reused for a different causal chain.  
Replay of the same process appends is rejected or idempotent per rules.

## Records without processId

Only pure system records: genesis, some node registry, global param changes.  
Economic and process lifecycle records **require** processId.
