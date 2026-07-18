# 01_ledger — journal core

**Status:** documented (see sibling files)

This is the heart of `01_NodeChain`: append-only journal, hash chain, ExecutionSnapshot, write/read paths.

## Planned

| File | Content |
|------|---------|
| `journal-model.md` | Append-only model, height/sequence |
| `record-schema.md` | Record fields and types |
| `hash-chain.md` | content hash, prevHash |
| `execution-snapshot.md` | Snapshot after finalize / batch |
| `immutability.md` | No rewrite / delete |
| `write-path.md` | Who appends, fail-closed |
| `read-path.md` | Query by processId / height |
| `validity-rules.md` | No record ⇒ event invalid |
