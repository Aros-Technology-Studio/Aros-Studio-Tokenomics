# Query API

```text
GetByHeight(height) → Record
GetByRecordId(recordId) → Record
ListByProcessId(processId, cursor?) → Record[]
GetTip() → { height, tipHash }
```

## AuthZ

Institution principals: filter to own processes.  
Internal/All-Seeing Eye: broader per policy.

## Errors

`E_NOT_FOUND`, `E_UNAUTHORIZED`, `E_UNAUTHENTICATED`.
