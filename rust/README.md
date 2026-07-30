# Rust workspace (ENV #44)

**Status:** optional companion crates.  
**Primary implementation of AST core path:** TypeScript under `src/` (NodeChain journal, PoT, pipeline).

These crates hold shared types and a journal model for future high-performance / FFI work — they do **not** replace the TS SoT path until explicitly promoted.

## Install Rust (once)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version
cargo --version
```

## Commands

Always from the **repo root** (not `~`):

```bash
cd /Users/ketevanarevadze/Aros-Studio-Tokenomics   # or your clone path

# root helper
npm run test:rust

# or
cd rust && cargo test
```

| Crate | Role |
|-------|------|
| `nodechain-journal` | Append-only record + hash-chain types |
| `pot-types` | P1–P4 criteria result types |

## CI

GitHub Actions job `rust` runs `cargo test --workspace` under `rust/`.

## Note

`Cargo.lock` is committed for reproducible CI builds of this companion workspace.
