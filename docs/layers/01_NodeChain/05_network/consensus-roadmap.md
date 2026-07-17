# Consensus roadmap (not v1 core)

## v1 position

**PoT + append quorum is enough** for first institutional deployment.  
Full BFT multi-shard consensus is **not** required to start the ledger.

## Later candidates

- HotStuff / Tendermint-style ordering among confirmers  
- Pipelined batch finality  
- PQ signature suites  

## Constraints on any future consensus

1. Must not introduce stake-weighted voting for truth.  
2. Must not replace append-only journal with mutable blocks API.  
3. Must remain replayable and deterministic.  
4. Must not move PoT criteria into consensus “vote yes on value”.

When implemented, this file becomes a design record; until then, treat as backlog.
