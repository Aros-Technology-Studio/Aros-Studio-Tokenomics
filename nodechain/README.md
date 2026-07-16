# NodeChain layout alias

**Canonical docs:** `docs/components/nodechain/`  
**Core Canon:** `docs/AST-CORE-CANON.md` §4.1  
**Implementation target:** `src/nodechain/`  

Append-only ledger (ExecutionSnapshot / state entry — not “blocks”).  
Primary storage target: RocksDB; Postgres = index mirror only.  
Build schedule **Phase 1** owns this module.
