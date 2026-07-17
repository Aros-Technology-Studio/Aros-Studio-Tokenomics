# Hash chain

## Purpose

Cryptographic linking makes any gap, reorder, or silent rewrite detectable.

## Links

```text
record[h].prevHash  ==  record[h-1].contentHash   (or envelope hash — fixed in impl)
record[h].contentHash  ==  H(canonical body of record[h] without height if height assigned after — see note)
```

**Implementation note:** Choose one of:

- **A:** `contentHash` over payload only; separate `envelopeHash` includes height + prevHash; chain uses `envelopeHash`.  
- **B:** height assigned, then full envelope hashed once.

v1 must pick **one** and document it in `algorithms.md`. Recommended: **envelope hash chain** including `height`, `prevHash`, `contentHash`, `recordType`, `processId`.

## Genesis

`record[0].prevHash` is a fixed constant (e.g. 32 zero bytes) published in genesis.

## Verification

Any node or auditor:

1. Walk from genesis to tip.  
2. Recompute hashes.  
3. Reject chain if any `prevHash` mismatch or signature invalid.

## Fork policy (v1)

v1 assumes a **single logical writer path** or quorum-agreed append that yields one tip.  
Competing tips are a **fault**: do not auto-merge inventively; halt appends on that partition path and recover by replay of the durable majority/canonical store (see fault-tolerance).  
Full BFT fork choice: later (`consensus-roadmap.md`).

## Tamper evidence

Changing any historical payload breaks all subsequent `prevHash` links.  
That is intentional: NodeChain integrity is structural, not trust in a single disk file alone.
