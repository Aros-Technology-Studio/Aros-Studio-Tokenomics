# PURPOSE — `node-reputation`

**Status:** ready (support module)  
**P4.16:** **real in v1**  
**Code path:** `src/node-reputation/`

Reputation and weight for nodes (suspend without slashing; commission weights).

```
nodeReputation = (Σ successful / Σ total) × uptimeFactor
```

(`CANON.md` §9.8). Grace period default **24h** on suspend.
