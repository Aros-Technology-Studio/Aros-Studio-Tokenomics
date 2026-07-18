# Validator registry

Standing is **explicit registration**, not stake or ARO weight.

## Status

| Status | Effect |
|--------|--------|
| `active` | Eligible for PoT confirmer set |
| `suspended` | Excluded from `resolveEligible` |

## API

```ts
reg.register / registerMany
reg.suspend(id, reason)
reg.restore(id)
reg.resolveEligible(proposedIds)  // active ∩ proposed
```

Empty registry = bootstrap mode (proposed ids used as-is) for tests only.

## Integration

`PotService` holds a `ValidatorRegistry`. Suspended validators shrink K; if K < kMin (default 3), quorum fails → `verified=0`.

Code: `src/pot/validator-registry.ts`
