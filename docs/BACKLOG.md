# Backlog — do not drop

Tracked items beyond shipped core path.  
GitHub Issues are the operational list; this file is the in-repo mirror.

## Shipped hardening / governance

| # | Item | Issue | Status |
|---|------|--------|--------|
| 1 | **HSM key provider** | [#68](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/68) | **Done** — `KeyProvider` + `HsmKeyProvider` (`AST_KEY_PROVIDER=hsm`) |
| 2 | **Network replication** | [#69](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/69) | **Done** — `JournalReplicator` catch-up, diverge refuse |
| 3 | **Formal L3 LLM adapters** | [#70](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/70) | **Done** — `llm-adapters.ts` + `AST_L3_USE_LLM` |

## Already in v1 (reference)

- NodeChain journal (memory / file / RocksDB)
- Ed25519 sign/verify on append
- L1 + L2 committee + L3 policy / LLM panel
- Kill-switch, verifyEveryN
- Layers 01–10 + orchestrator + core API
- Portal edge + institution token auth + КЭП hash verify

## Portal edge

- [x] Layout + OpenAPI + architecture  
- [x] Wire Nest edge → Core Orchestrator (`CoreApiClient`)  
- [x] Institution session auth (login / `X-Session-Id`) + Core `X-Institution-Token` hand-off  
- [x] Document package hash API + primary tokenization UI (dashboard / new / status)  
- [ ] Full X.509 chain / production mTLS (ops deploy)

## Later (owner-driven)

- External security audit  
- Cloud KMS / real PKCS#11 behind `KeyProvider`  
- Multi-region replication mesh (beyond single catch-up API)  
- Live multi-vendor LLM keys in prod secrets store  

---

Update this table when issues are closed or new must-not-forget items appear.
