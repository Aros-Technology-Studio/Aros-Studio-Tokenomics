# Admissibility

Admissibility is the **conjunction of P1–P4**. It is separate from quorum:

```
mayBePositive = criteriaPass(P1–P4)
verified = 1  iff  mayBePositive ∧ quorumOk ∧ ¬timeout
```

An admissible process without quorum still gets `verified=0` with `QUORUM_SHORT`.  
An inadmissible process never becomes `verified=1` even with full quorum.
