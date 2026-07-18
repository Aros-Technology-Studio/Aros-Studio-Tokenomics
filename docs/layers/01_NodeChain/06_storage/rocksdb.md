# RocksDB primary store

**Implementation:** `src/nodechain/rocksdb.store.ts`  
**Engine flag:** `AST_JOURNAL_ENGINE=rocksdb` or `--engine rocksdb`

## Keys

| Key | Value |
|-----|--------|
| `h/{height:016}` | JournalRecord JSON |
| `id/{recordId}` | height |
| `client/{clientRecordId}` | recordId |
| `tip` | `{ height, tipHash }` |

## Notes

- Create-if-missing on open.  
- File and memory engines remain for tests/dev.  
- npm package `rocksdb` is LevelDOWN-style; wrap is promisified.  
- Production: pin path on durable volume; backup via checkpoint/export.
