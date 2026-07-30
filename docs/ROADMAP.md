# ROADMAP

## Done — v1.0.0 public release

- Core Canon + P0–P4 decisions  
- Layers 01–10 documentation map  
- NodeChain journal + tokenize pipeline  
- RocksDB / Ed25519 / L1–L3 / guards  
- ENV: Docker, Postgres schema, Solidity view, Rust companion, CI  
- Hardening #68–#70 (HSM, replication, L3 LLM adapters)  
- **Institutional portal** edge (`portal/`): login, document hash, submit, status UI → Core  
- **Release packaging:** Docker Compose full stack, GHCR images, tag `v1.0.0`  

## Engineering complete (repo) — 2026-07-30

Blocks **A · B · C · D · E (Solidity) · I · F** — see `docs/COMPLETION-TRACK.md` · `docs/contracts/SOLIDITY-BLOCK-E.md`.

## Next (owner-driven)

| Priority | Item |
|----------|------|
| A | Host cutover (`docs/cutover/`) + field tag |
| B | Testnet/mainnet ArosCoinView deploy if explorers need it (E2 residual) |
| B | Production IdP/JWKS + national QTSP residual |
| C | External audit engagement ([`AUDIT-PREP-F2.md`](AUDIT-PREP-F2.md)) |

## Later

- Optional multi-node BFT  
- Cloud KMS / multi-region replication mesh
