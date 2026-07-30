# Solidity workspace (ENV #46)

**Scope:** representation / view adapters only.  
**Not SoT.** Token state lives in NodeChain + PoT.

## Layout

```
contracts/
  foundry.toml
  src/representation/ArosCoinView.sol
  test/ArosCoinView.t.sol
```

## Tooling — Foundry

Install once (macOS):

```bash
brew install foundry
# or: curl -L https://foundry.paradigm.xyz | bash && foundryup
```

Requires `forge` on `PATH` (Homebrew: `/opt/homebrew/bin/forge`).

## Commands

```bash
# from repo root
npm run test:contracts

# or
cd contracts && forge test -vv
```

## CI

GitHub Actions job `contracts` installs Foundry and runs `forge test` (see `.github/workflows/ci.yml`).

## Forbidden

- Free mint / adminMint as product authority  
- Third-party custody vaults as AST core  
- Treating ERC balances as canonical supply  
