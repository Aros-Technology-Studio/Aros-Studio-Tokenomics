# Split 70/30
```
fee = valuation * feeRate
nodesPool = fee * 0.70
astShare  = fee - nodesPool   # exact residual
node_i    = nodesPool * (w_i / Σw)
```
Configurable later; ship default fixed 70/30.
