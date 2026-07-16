# NodeChain engine (layout alias)

**Status:** scaffold  
**Canonical docs:** `docs/components/nodechain/`  
**Implementation target:** `src/nodechain/` (NestJS) with **RocksDB** primary ledger store + Postgres index mirror.

This directory is the **layout alias** for `nodechain_engine` + `ledger` store (**one binary**). Product code and package boundaries should remain aligned with `CANON.md` §4.1 and the nodechain pack.
