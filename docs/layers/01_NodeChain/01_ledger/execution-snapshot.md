# ExecutionSnapshot

## Definition

An **ExecutionSnapshot** is a deterministic digest of NodeChain (and agreed derived indices) at a given main-chain height (or height range end).  
It allows fast recovery and audit without replaying the entire history every time — **provided** the snapshot is itself a pure function of recorded causes.

## What a snapshot contains (logical)

| Field | Meaning |
|-------|---------|
| `snapshotId` | Stable id |
| `atHeight` | Inclusive tip height covered |
| `stateRoot` | Root hash of agreed state representation |
| `journalTipHash` | Envelope hash at `atHeight` |
| `schemaVersion` | Snapshot format version |
| `createdUtc` | UTC |
| `writerId` | Who produced the snapshot artifact |
| `signatures` | Attestation of producers if multi-party |

Exact state tree layout is implementation-defined but must be **reproducible** from the journal.

## Rules

1. A snapshot **never** invents records not in the journal.  
2. If snapshot and full replay disagree, **journal wins**; snapshot is discarded/rebuilt.  
3. Snapshots are optional optimization; tip integrity does not require them.  
4. Snapshot creation is itself journaled as `execution_snapshot` record (payload = metadata + roots), or stored as side artifact with hash committed on-chain — pick one and keep consistent.

## When to take snapshots

- After process finalization batch;  
- Periodic (e.g. every N heights);  
- Before maintenance / backup.

## Recovery

1. Load latest trusted snapshot ≤ target height.  
2. Replay journal records `(snapshot.atHeight, target]`.  
3. Verify tip hash.

## Relation to PoT

PoT may **embed or reference** snapshot hashes as evidence of recorded state (P3).  
NodeChain produces the snapshot material; PoT interprets criteria elsewhere.
