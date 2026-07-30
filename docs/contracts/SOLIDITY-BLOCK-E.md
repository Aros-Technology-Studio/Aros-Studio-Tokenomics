# Block E — Solidity / representation

**Status:** Engineering E1–E3 done · E4 explicit non-goal  
**Law:** NodeChain + PoT = SoT. On-chain ARO-VIEW is **representation only**. No free mint.

| ID | Item | Status |
|----|------|--------|
| **E1** | `ArosCoinView` Foundry tests green | ✅ `npm run test:contracts` |
| **E2** | Testnet deploy runbook + reporter keys | ✅ [`DEPLOY-TESTNET-E2.md`](DEPLOY-TESTNET-E2.md) |
| **E3** | Reporter ↔ journal tip attest (ops) | ✅ `npm run contracts:report-tip` |
| **E4** | Free mint / ERC-as-SoT | ❌ **Out** — Canon forbid · [`NON-GOALS-E4.md`](NON-GOALS-E4.md) |

## Layout

```
contracts/
  src/representation/ArosCoinView.sol
  test/ArosCoinView.t.sol
  script/DeployArosCoinView.s.sol
  foundry.toml
```

## Commands

```bash
npm run test:contracts
npm run contracts:deploy -- --help
npm run contracts:report-tip -- --help
```

## Related

- `docs/portal/WALLET-COMPAT.md` — wallet adapters, not mint  
- Core journal tip: `GET /v1/core/nodechain/status`  
