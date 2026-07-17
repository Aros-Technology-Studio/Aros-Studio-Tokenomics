# Read path

## Queries (logical)

| Query | Use |
|-------|-----|
| `getByHeight(h)` | Single record |
| `getByRecordId(id)` | Stable id lookup |
| `listByProcessId(processId)` | Full process history ordered by height |
| `listByType(type, cursor)` | Operational scans |
| `getTip()` | Current height + tip hash |
| `getSnapshot(atHeight)` | Snapshot metadata |

## Ordering

List endpoints return **height ascending** unless specified.  
Never invent order different from main chain for SoT views.

## Access control

| Principal | Scope |
|-----------|--------|
| Internal services | As authorized |
| Institution | **Own processes only** (filter by institution id on process records) |
| ASE / audit roles | Broad read per deployment policy |
| Anonymous | None |

## Consistency

- Primary store is source for SoT reads.  
- Index mirror (Postgres) may be used for secondary filters; if mirror and primary disagree, **primary wins**.  
- Stale mirror: return or signal lag; do not silently trust mirror for integrity proofs.

## Proof reads

For external audit, prefer:

- range of records + hash chain proof;  
- or snapshot + replay segment.

## No silent filtering of SoT

Authorization may hide records from a principal; it must not rewrite history for principals who are allowed full audit access.
