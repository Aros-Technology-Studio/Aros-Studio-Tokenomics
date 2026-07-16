# CONTRACT — `reserve`

**Status:** ready  
**Canon refs:** `CANON.md` §4.4; clarifications P0.3

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| lock request | reserve service API (internal) | yes before mint | amount + asset type |
| PoT processId / rate snapshot | pot / nodechain | yes for mint bind | snapshot rate at PoT |
| partial release request | internal release path | no | spawns child records |
| process volume updates | nodechain / pot | yes for index | confirmed volume only |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| lock ack / hard fail | mint path | no queue |
| allocation records | NodeChain | primary |
| child release records | NodeChain | immutable history |
| reserveIndex | release_daemon, metrics | log10 formula |
| mirror lock txs | Solidity adapter | not primary truth |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `ReserveLocked` | out | hard lock taken |
| `ReserveLockFailed` | out | insufficient → hard fail |
| `ReserveAllocated` | out | claim(s) against bag |
| `ReserveChildReleased` | out | partial release child record |
| `ReserveIndexUpdated` | out | index recomputed |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodechain` | primary ledger |
| `pot` | confirmation timing / process bind |
| `invariants` | I6 and write-path asserts |

| Depended on by | Why |
|----------------|-----|
| `aroscoin` / emission | lock before mint |
| `release` / release_daemon | index + release records |
| Solidity adapters | mirror locks |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| insufficient reserve | **hard fail** |
| third-party custody request | reject (forbidden) |
| public external API call (v1) | not exposed |
| Solidity disagrees with NodeChain | NodeChain wins; repair mirror |
| unlock without child/full release rules | fail closed |

API: **internal only** for v1 (no institutional public reserve API).
