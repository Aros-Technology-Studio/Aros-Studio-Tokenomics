# Solidity workspace (Block E · ENV #46)

**Scope:** representation / view adapters only.  
**Not SoT.** Token state lives in NodeChain + PoT.

**Track:** [`docs/contracts/SOLIDITY-BLOCK-E.md`](../docs/contracts/SOLIDITY-BLOCK-E.md)

## Layout

```
contracts/
  foundry.toml
  src/representation/ArosCoinView.sol
  test/ArosCoinView.t.sol
  script/DeployArosCoinView.s.sol
```

## Tooling — Foundry

Install once (macOS):

```bash
brew install foundry
# or: curl -L https://foundry.paradigm.xyz | bash && foundryup
```

Requires `forge` + `cast` on `PATH` (Homebrew: `/opt/homebrew/bin`).

## Commands

```bash
# from repo root
npm run test:contracts          # E1
npm run contracts:deploy        # E2 — needs RPC_URL DEPLOYER_PK REPORTER
npm run contracts:report-tip    # E3 — needs RPC_URL REPORTER_PK ARO_VIEW

# or
cd contracts && forge test -vv
```

## Docs

| Doc | Topic |
|-----|--------|
| [`DEPLOY-TESTNET-E2.md`](../docs/contracts/DEPLOY-TESTNET-E2.md) | Testnet deploy + keys |
| [`REPORTER-TIP-E3.md`](../docs/contracts/REPORTER-TIP-E3.md) | Tip attest ops |
| [`NON-GOALS-E4.md`](../docs/contracts/NON-GOALS-E4.md) | No free mint / ERC-as-SoT |

## CI

GitHub Actions job `contracts` installs Foundry and runs `forge test` (see `.github/workflows/ci.yml`).

## Forbidden (E4)

- Free mint / adminMint as product authority  
- Third-party custody vaults as AST core  
- Treating ERC balances as canonical supply  
