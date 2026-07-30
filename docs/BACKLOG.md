# Backlog — do not drop

Tracked items beyond shipped core path.  
GitHub Issues are the operational list; this file is the in-repo mirror.

**A6 (2026-07-30):** Stale MIGRATE/DOC/INTERFACE noise closed — see `docs/ISSUE-HYGIENE-A6.md`.

## Open GitHub issues (after A6)

| # | Title | Owner |
|---|--------|--------|
| [#52](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/52) | DOC: `docs/ONTOLOGY.md` (+ Application) | Docs when prioritized |
| [#41](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/41) | LEGAL: regulatory verification | Owner / counsel |
| [#34](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/34) | SYNC: mirror docs to Notion | Owner-deferred |

## Shipped hardening / governance

| # | Item | Issue | Status |
|---|------|--------|--------|
| 1 | **HSM key provider** | [#68](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/68) | **Done** |
| 2 | **Network replication** | [#69](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/69) | **Done** |
| 3 | **Formal L3 LLM adapters** | [#70](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/70) | **Done** |

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
- [x] X.509 detached chain at portal edge (D4 pilot) — national QTSP residual  
- [ ] Production mTLS / OIDC (ops deploy, D6)

## Later (owner-driven)

- External security audit  
- Cloud KMS / real PKCS#11 behind `KeyProvider`  
- Multi-region replication mesh (beyond single catch-up API)  
- Live multi-vendor LLM keys in prod secrets store  

---

Update this table when issues are closed or new must-not-forget items appear.
