# Failure codes (NodeChain)

| Code | Meaning |
|------|---------|
| `E_UNAUTHENTICATED` | No valid client identity |
| `E_UNAUTHORIZED` | Identity cannot write this type |
| `E_SCHEMA` | Payload/header schema invalid |
| `E_HASH_MISMATCH` | contentHash or chain link wrong |
| `E_BAD_SIGNATURE` | Signature verify failed |
| `E_QUORUM_SHORT` | Append co-sign Q not met |
| `E_IDEMPOTENT_CONFLICT` | Same key different payload |
| `E_PROCESS_REQUIRED` | processId missing |
| `E_UNKNOWN_TYPE` | recordType not registered |
| `E_READ_ONLY` | Kill-switch / read-only mode |
| `E_STORAGE` | Durability failure |
| `E_NOT_FOUND` | Query miss |
| `E_MIRROR_STALE` | Optional: mirror lag exceeded (query path) |

All append failures are **fail-closed** (no height).
