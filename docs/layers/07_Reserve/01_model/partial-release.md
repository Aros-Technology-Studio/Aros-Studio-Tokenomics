# Partial release

```
partialRelease({ processId, amount, parentClaimId? })
```

- Hard fail if insufficient  
- Child claim `kind: child_release`  
- Journal `reserve_release`  
