# Rust workspace (ENV #44)

**Status:** optional companion crates.  
**Primary implementation of AST core path:** TypeScript under `src/` (NodeChain journal, PoT, pipeline).

These crates hold shared types and a journal model for future high-performance / FFI work — they do **not** replace the TS SoT path until explicitly promoted.

```bash
cd rust && cargo test
```

| Crate | Role |
|-------|------|
| `nodechain-journal` | Append-only record + hash-chain types |
| `pot-types` | P1–P4 criteria result types |
