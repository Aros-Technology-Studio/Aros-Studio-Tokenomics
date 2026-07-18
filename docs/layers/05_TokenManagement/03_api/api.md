# API

```
balanceOf(holderId)
totalSupply()
snapshot()
hydrateFromJournal()
mintAfterPot({ processId, holderId, amount, potVerified, potLedgerHeight, claimId? })
burn({ processId, holderId, amount, claimId? })
transferAfterPot({ processId, fromHolderId, toHolderId, amount, potVerified, potLedgerHeight })
revalueAfterPot({ processId, previousValue, newValue, potVerified, potLedgerHeight })
```

Errors: `TokenError` + `TokenErrorCode`.
