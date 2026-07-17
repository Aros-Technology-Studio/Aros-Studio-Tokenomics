# Quorum for append

## Scope

This is **ledger write attestation** (who must co-sign that a record entered the journal).  
It is **not** PoT criteria evaluation (P1–P4).

## Default threshold

For multi-writer mode:

```text
Q = ceil(2/3 · K)   with K_min = 3
```

Aligned with Byzantine bound used in prior AST materials; same numbers may be shared operationally with PoT confirmer sets, but **logically separate**.

## Eligible set

Active **confirmer** nodes not suspended, in current membership record.

## Single-writer deployments

Sandbox/local may use K=1 with explicit config `appendQuorumMode=single` — production institutional mode should use multi-writer.

## Failure to reach Q

- no height assigned;  
- timeout → writer retries or process layer fails closed;  
- do not lower Q ad hoc to “get through”.
