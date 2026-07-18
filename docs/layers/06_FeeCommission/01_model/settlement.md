# Settlement

```
fee = valuation × feeRate × (1 − waiver)
nodesPool = fee × nodesShare
astShare = fee − nodesPool
payment_i = nodesPool × w_i / Σw
```

Journal:

1. `commission_settled`  
2. `payment_credited` per node  

Double settle → `COMM_ALREADY_SETTLED`.
