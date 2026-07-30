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

Blocks **A · B · C · D · I · F** — see `docs/COMPLETION-TRACK.md` · `docs/FINAL-ENGINEERING-F5.md`.

## Next (owner-driven)

| Priority | Item |
|----------|------|
| A | Live domain + secrets vault cutover ([`GO-LIVE-F1.md`](GO-LIVE-F1.md)) |
| B | Production IdP/JWKS + national QTSP residual |
| B | Managed multi-tenant deploy / monitoring |
| C | External audit engagement ([`AUDIT-PREP-F2.md`](AUDIT-PREP-F2.md)) |

## Later

- Optional multi-node BFT  
- Cloud KMS / multi-region replication mesh
