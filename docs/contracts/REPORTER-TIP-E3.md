# E3 — Reporter ↔ journal tip attest (ops)

**Flow:** Core journal tip → reporter key → `ArosCoinView.attestJournalTip(height, tipHash)`.

```
NodeChain tip (SoT)
    │  GET /v1/core/nodechain/status  or  npm run journal:status
    ▼
scripts/report-journal-tip.ts
    │  cast send attestJournalTip
    ▼
ArosCoinView (representation — not SoT)
```

---

## Prerequisites

- E2 deploy done → `ARO_VIEW` / `AST_ARO_VIEW_CONTRACT`
- `REPORTER_PK` matches `reporter()` on contract
- Core reachable for tip (or pass `--height` / `--tip` manually)
- `RPC_URL`

---

## Run

```bash
# Auto tip from Core (default http://127.0.0.1:3000)
export RPC_URL=…
export REPORTER_PK=…
export ARO_VIEW=0x…
export CORE_API_URL=http://127.0.0.1:3000

npm run contracts:report-tip

# Dry-run (print args only)
npm run contracts:report-tip -- --dry-run

# Explicit tip (no Core)
npm run contracts:report-tip -- --height 12 --tip 0xabc…64hex
```

## Success

- Tx hash printed  
- `cast call $ARO_VIEW "lastJournalHeight()(uint256)"` matches  
- `lastJournalTipHash()` matches journal tip (bytes32)

## Failure modes

| Symptom | Fix |
|---------|-----|
| NotReporter | Wrong `REPORTER_PK` |
| Core unreachable | Start Core or pass `--height`/`--tip` |
| tip not 32 bytes | Use full envelope hash hex (64 hex chars) |

## Acceptance (E3)

| Check | Evidence |
|-------|----------|
| Script | `scripts/report-journal-tip.ts` |
| Docs | this file |
| Optional schedule | owner cron / CI residual |

**Not E3:** automatic every-block mainnet bot with HSM (ops residual).
