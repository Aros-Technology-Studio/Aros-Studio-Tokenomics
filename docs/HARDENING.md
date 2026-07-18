# Hardening

## Controls

| Control | Code |
|---------|------|
| Kill-switch | `src/hardening/kill-switch.ts` — blocks appends, engage on chain fail |
| Periodic chain verify | `NodechainService` `verifyEveryN` |
| Real crypto required | `requireRealCrypto` + KeyRegistry |
| Payload deep-clone | append freezes history from caller mutation |
| Double-mint guard | TokenService |
| PoT before mint | TokenService + pipeline |
| L1/L2/L3 gates | GovernanceService |
| ASE no veto | EyeService.veto throws |
| Fail-closed errors | NodeChainError codes |

## Env

| Var | Meaning |
|-----|---------|
| `AST_JOURNAL_ENGINE` | `memory` \| `file` \| `rocksdb` |
| `AST_JOURNAL_DIR` | path for file/rocksdb |
| `AST_REQUIRE_CRYPTO` | `1` force ed25519 |
| `AST_VERIFY_EVERY_N` | chain verify interval |
| `ALLOW_DEV_ATTEST` | allow legacy self-attest (tests only) |

## Must-not-forget (open)

| Item | Issue |
|------|--------|
| HSM key provider (prod keys) | [#68](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/68) |
| Network replication of journal | [#69](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/69) |
| Formal L3 LLM adapters | [#70](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/issues/70) |

Full list: [`docs/BACKLOG.md`](BACKLOG.md).
