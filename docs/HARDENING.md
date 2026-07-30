# Hardening

## Controls

| Control | Code |
|---------|------|
| Kill-switch | `src/hardening/kill-switch.ts` — blocks appends, engage on chain fail |
| Periodic chain verify | `NodechainService` `verifyEveryN` |
| Real crypto required | `Ed25519` via `KeyRegistry` / `KeyProvider` |
| HSM key provider | `AST_KEY_PROVIDER=hsm` → soft-HSM vault (AES-GCM); swap for PKCS#11 later |
| Journal replication | `JournalReplicator.catchUpFrom` — refuse divergent tips |
| Payload deep-clone | append freezes history from caller mutation |
| Double-mint guard | TokenService |
| PoT before mint | TokenService + pipeline |
| L1/L2/L3 gates | GovernanceService |
| All-Seeing Eye no veto | AllSeeingEyeService.veto throws |
| Fail-closed errors | NodeChainError codes |

## Env

| Var | Meaning |
|-----|---------|
| `AST_JOURNAL_ENGINE` | `memory` \| `file` \| `rocksdb` |
| `AST_JOURNAL_DIR` | path for file/rocksdb |
| `AST_REQUIRE_CRYPTO` | `1` force ed25519 |
| `AST_VERIFY_EVERY_N` | chain verify interval |
| `AST_KEY_PROVIDER` | `memory` \| `file` \| `hsm` |
| `AST_HSM_MASTER_KEY` | 64-hex master for soft-HSM seal |
| `AST_L3_USE_LLM` | `1` enables five-agent LLM/mock panel |
| `AST_L3_LLM_PROVIDER` | `mock` \| `openai_compatible` |
| `AST_REQUIRE_INSTITUTION_AUTH` | `1` requires `X-Institution-Token` on core writes |
| `AST_INSTITUTION_TOKEN` | portal → core institution secret |

## Must-not-forget

| Item | Issue | Status |
|------|--------|--------|
| HSM key provider | #68 | Done (soft-HSM + interface) |
| Network replication | #69 | Done (catch-up API) |
| Formal L3 LLM adapters | #70 | Done (adapters + mock/OpenAI-compatible) |

Full list: [`docs/BACKLOG.md`](BACKLOG.md).

## Block F (Bar B) — hardening / ops / prod

| ID | Doc |
|----|-----|
| Rollup | [`hardening/BLOCK-F.md`](hardening/BLOCK-F.md) |
| F1 External audit | [`hardening/EXTERNAL-AUDIT-F1.md`](hardening/EXTERNAL-AUDIT-F1.md) |
| F2 KMS / PKCS#11 | [`hardening/KMS-PKCS11-F2.md`](hardening/KMS-PKCS11-F2.md) |
| F3 Multi-region mesh | [`hardening/MULTI-REGION-F3.md`](hardening/MULTI-REGION-F3.md) |
| F4 L3 LLM keys | [`hardening/L3-LLM-KEYS-F4.md`](hardening/L3-LLM-KEYS-F4.md) |
| F5 Backup/restore drill | [`hardening/DRILL-F5.md`](hardening/DRILL-F5.md) · `npm run drill:backup-restore` |
| F6 Monitoring | [`hardening/MONITORING-F6.md`](hardening/MONITORING-F6.md) · `npm run monitor:smoke` |
