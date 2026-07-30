# 08_api

**Status:** documented + HTTP mapped for core Nest

Contracts of this layer: append, query, snapshot, events out.

## Logical contracts

| Doc | Contract |
|-----|----------|
| `append-api.md` | Append (internal writers only) |
| `query-api.md` | GetByHeight, GetByRecordId, ListByProcessId, ListNodes, GetTip |
| `nodes-vs-registry.md` | **B5** — chain ListNodes vs network registry (`/v1/core/nodes`) |
| `snapshot-api.md` | CreateSnapshot / GetSnapshot |
| `events-out.md` | Observer stream (`/v1/core/eye/stream`) |

## HTTP mapping (core Nest)

Base path: `/v1/core/nodechain`

| Logical | HTTP |
|---------|------|
| GetTip | `GET …/tip` |
| GetStatus (ops) | `GET …/status` |
| Verify chain | `GET …/verify` |
| ListNodes (Nodes list) | `GET …/nodes?limit=` |
| GetByHeight | `GET …/records/height/:height` |
| GetByRecordId | `GET …/records/id/:recordId` |
| ListByProcessId | `GET …/processes/:processId` |
| EnsureGenesis | `POST …/genesis` |

**Vocabulary:** chain unit = **node** (`nodes` list). Not product-API “blocks”.  
Network participant registry remains separate: `GET /v1/core/nodes`.

**Append** is not an open HTTP route. Core services call `NodechainService.append` in-process. Portal never mints and never appends as SoT writer.

See `../ASSEMBLY.md` for run book.
