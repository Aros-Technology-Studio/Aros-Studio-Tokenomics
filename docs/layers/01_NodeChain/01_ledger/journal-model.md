# Journal model

## Definition

The NodeChain journal is an **append-only sequence** of immutable **records**.  
Each accepted record receives a monotonic **height** (sequence number) on the main chain.

## Properties

| Property | Rule |
|----------|------|
| Append-only | New records only; no update-in-place, no delete |
| Ordered | Global total order by `height` on the main chain |
| Immediate immutability | Once ack’d as durable, content is permanent |
| Causal | Effects in other layers are acknowledged only after related cause records exist (write-ahead) |
| Deterministic identity | Record identity is content-addressable via `contentHash` |

## Main chain vs in-process structure

- **Main chain:** linear sequence of journal records (v1 default).  
- **Inside one `processId`:** optional DAG or ordered sub-sequence of related records for stages — still projected onto the main chain as appends.  
- Product API does not use “blocks”.

## Record envelope (logical)

Every journal record includes at least:

| Field | Meaning |
|-------|---------|
| `height` | Monotonic position after accept |
| `recordId` | Stable id (e.g. UUIDv7) |
| `recordType` | Catalog type (see process binding) |
| `processId` | Binding when process-scoped; may be null only for pure system ops |
| `prevHash` | Hash of previous main-chain record |
| `contentHash` | Hash of canonical payload bytes |
| `writerId` | Authenticated writer identity |
| `writerRole` | Role used for this append |
| `timestampUtc` | UTC time of accept (ordering secondary to height) |
| `payload` | Type-specific body (canonical encoding) |
| `signatures` | Writer (and optional co-signers) |

## Height rules

1. Heights start at a genesis record (`height = 0` or `1` — fixed in implementation).  
2. Exactly one record per height on the main chain.  
3. Gaps are forbidden after durability.  
4. Clients never assign height; the ledger assigns on accept.

## Batching

Operational **batches** may group appends for storage efficiency.  
A batch is not a product “block”: each record still has its own height and hash links.  
**ExecutionSnapshot** may cover a range of heights (see `execution-snapshot.md`).

## Genesis

A genesis record anchors `prevHash` and parameters snapshot (algorithm ids, schema version).  
Changing schema later requires a versioned record type, not mutation of genesis.
