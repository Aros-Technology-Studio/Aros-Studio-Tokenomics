# Backlog — do not drop

Tracked items beyond shipped core path.  
GitHub Issues are the operational list; this file is the in-repo mirror.

**G1 sync (2026-07-30):** Aligned with completion blocks A–G · E · F · I after owner triage.

**A6 (2026-07-30):** Stale MIGRATE/DOC/INTERFACE noise closed — see `docs/ISSUE-HYGIENE-A6.md`.

## Open GitHub issues (after A6)

| # | Title | Owner |
|---|--------|--------|
| [#52](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/52) | DOC: `docs/ONTOLOGY.md` (+ Application) | Docs when prioritized |
| [#41](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/41) | LEGAL: regulatory verification | Owner / counsel |
| [#34](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/34) | SYNC: mirror docs to Notion | Owner-deferred |

## Owner sign-offs (open)

| Item | Action | Doc |
|------|--------|-----|
| **B1 / G2** | Reply **`B1 approved`** or list amendments | `docs/layers/01_NodeChain/09_acceptance/OWNER-REVIEW.md` |
| **F1** | Engage external auditor | `docs/hardening/EXTERNAL-AUDIT-F1.md` |
| Host cutover | Run E-ops packages on real host | `docs/cutover/` |

## Shipped hardening / governance

| # | Item | Issue | Status |
|---|------|--------|--------|
| 1 | **HSM key provider** (soft-HSM) | [#68](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/68) | **Done** · real KMS/PKCS#11 = F2 residual |
| 2 | **Network replication** (catch-up) | [#69](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/69) | **Done** · multi-region mesh = F3 residual |
| 3 | **Formal L3 LLM adapters** | [#70](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/70) | **Done** · live multi-vendor keys = F4 residual |

## Already in v1 (reference)

- NodeChain journal (memory / file / RocksDB)
- Ed25519 sign/verify on append
- **Nodes list** API/UI — not product “blocks” (A8 / B5 · `VOCABULARY.md`)
- L1 + L2 committee + L3 policy / LLM panel
- Kill-switch, verifyEveryN
- Layers 01–10 + orchestrator + core API
- Portal edge + institution auth + document-first path

## Portal edge

- [x] Layout + OpenAPI + architecture  
- [x] Wire Nest edge → Core Orchestrator (`CoreApiClient`)  
- [x] Institution session auth + Core hand-off  
- [x] Document package hash + primary tokenization UI  
- [x] X.509 detached (D4) · OCR assist (D5) · mTLS/OIDC hooks (D6)  
- [x] Secrets rotation (D7) · domain card (D8) · showcase+packs (D9/D10)  
- [x] Pilot brief refresh (G3) · Nodes vocabulary  

## Bar B residual (Block F — packages ready, owner ops)

- [ ] External security audit **engagement** (F1)  
- [ ] Cloud KMS / real PKCS#11 (F2)  
- [ ] Multi-region replication mesh (F3)  
- [ ] Live multi-vendor LLM keys in secrets store (F4)  
- [ ] Quarterly **production** backup/restore drill log (F5 offline drill ships)  
- [ ] Prometheus / Alertmanager wire (F6 smoke ships)  

## Later (owner-driven)

- Optional multi-node BFT  
- Mainnet ArosCoinView if explorers need it (E2 residual)  
- National QTSP / full IdP  

---

Update this table when issues are closed or new must-not-forget items appear.  
Master track: [`docs/COMPLETION-TRACK.md`](COMPLETION-TRACK.md).
