# Replication

## Goal

Every authorized replica holds the **same** journal bytes/logical records so crash of one node does not destroy SoT.

## Model (v1)

- Primary durable writer path (single logical leader **or** quorum-agreed append service).  
- Followers replicate by height: request `height > localTip`.  
- Verify hash chain on apply; reject broken segments.

## What is replicated

- Journal records  
- Snapshot artifacts (or their content hashes + blob channel)

## What is not

- Speculative forks as first-class product states  
- Different “truth” per institution

## Catch-up

New node: genesis → tip (or snapshot + tail).  
Never accept peer tip without chain verification.
