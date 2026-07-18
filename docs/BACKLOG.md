# Backlog — do not drop

Tracked items beyond v1 core path.  
GitHub Issues are the operational list; this file is the in-repo mirror so nothing is lost offline.

## Next hardening / governance (priority)

| # | Item | Issue | Notes |
|---|------|--------|--------|
| 1 | **HSM key provider** | [#68](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/68) | Replace `.ast-keys.json` for production; pluggable `KeyProvider` |
| 2 | **Network replication** | [#69](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/69) | Multi-node journal catch-up; no divergent tip on partition |
| 3 | **Formal L3 LLM adapters** | [#70](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/70) | Five-agent panel with real LLM adapters; keep deterministic backend for tests |

## Already in v1 (reference)

- NodeChain journal (memory / file / RocksDB)
- Ed25519 sign/verify on append
- L1 + L2 committee + L3 deterministic agent panel
- Kill-switch, verifyEveryN
- Layers 01–10 pipeline (`demo:tokenize`)

## Explicitly out of scope unless re-opened

- Issuer Portal / UI

---

Update this table when issues are closed or new must-not-forget items appear.
