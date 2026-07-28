# 08_api

**Status:** documented + HTTP mapped for core Nest

Contracts of this layer: append, query, snapshot, events out.

## Logical contracts

| Doc | Contract |
|-----|----------|
| `append-api.md` | Append (internal writers only) |
| `query-api.md` | GetByHeight, GetByRecordId, ListByProcessId, GetTip |
| `snapshot-api.md` | CreateSnapshot / GetSnapshot |
| `events-out.md` | Subscribe stream (residual durable bus) |

## HTTP mapping (core Nest)

Base path: `/v1/core/nodechain`

| Logical | HTTP |
|---------|------|
| GetTip | `GET …/tip` |
| GetStatus (ops) | `GET …/status` |
| Verify chain | `GET …/verify` |
| GetByHeight | `GET …/records/height/:height` |
| GetByRecordId | `GET …/records/id/:recordId` |
| ListByProcessId | `GET …/processes/:processId` |
| EnsureGenesis | `POST …/genesis` |

**Append** is not an open HTTP route. Core services call `NodechainService.append` in-process. Portal never mints and never appends as SoT writer.

See `../ASSEMBLY.md` for run book.
