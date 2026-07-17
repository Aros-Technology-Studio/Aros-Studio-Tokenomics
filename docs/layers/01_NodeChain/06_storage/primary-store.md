# Primary store

## Target

**RocksDB** (or equivalent embeddable LSM) as primary durable engine for the journal.

## Responsibilities

- Persist records by height and recordId  
- Atomic tip advance  
- Crash-safe durability (fsync policy explicit in ops)  
- Encryption at rest integration  

## Keys (illustrative)

```text
h/{height}           → record envelope bytes
id/{recordId}        → height
p/{processId}/{height} → recordId   (secondary)
tip                  → height + tipHash
```

## Forbidden

Using a relational DB as **only** SoT without journal semantics.  
Postgres is mirror/index (next doc).
