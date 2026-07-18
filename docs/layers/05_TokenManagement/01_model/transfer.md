# Transfer

Rights transfer is a **process** with its own PoT:

```
transferAfterPot({ processId, from, to, amount, potVerified=1, potLedgerHeight })
```

Journals `transfer_fact`. Updates balances. Total supply unchanged.
