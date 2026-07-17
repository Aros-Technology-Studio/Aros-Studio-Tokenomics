# Signatures on records

## Rule

Every accepted journal record carries at least one valid signature over the agreed signed region (`contentHash` or envelope).

## Multi-writer

For append classes that require co-sign:

- collect ≥ Q signatures from eligible confirmers;  
- Q default aligns with **2/3 of eligible set** (Byzantine-friendly bound), same spirit as paradigm quorum docs;  
- this is **append attestation**, not PoT P1–P4 evaluation.

## Invalid signature

- reject append;  
- optionally record security event;  
- standing impact via nodes service — not stake slash.

## Payment claim (cross-layer)

Signatures that prove confirmer participation may later feed **settlement weights**.  
NodeChain stores signatures; commission layer computes pay.
