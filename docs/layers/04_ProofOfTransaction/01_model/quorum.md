# Quorum (confirmer attestation)

## Formula

```
K = |eligibleValidators|
K_min = 3
Q = ceil(2/3 · K)
```

Accept confirmation set iff at least **Q** distinct confirmers are in the eligible set.

## Eligibility (v1)

- Listed in `validatorIds` for this evaluation  
- Optional: not suspended (when nodes registry is wired)  
- **Not** stake-weighted  

## Fail codes

- `QUORUM_SHORT` — fewer than Q valid confirmers  
- `QUORUM_K_BELOW_MIN` — K < 3  
- `QUORUM_UNKNOWN_CONFIRMER` — confirmer not in validator set (ignored for count)

## Relation to NodeChain append quorum

PoT quorum is **semantic confirmation of process criteria**.  
NodeChain may separately require co-sign on journal append. Both may share identity set; they are logically distinct.
