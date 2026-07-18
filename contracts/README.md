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

## Commands (Foundry)

```bash
# install foundry if needed: https://book.getfoundry.sh/getting-started/installation
cd contracts && forge test
```

## Forbidden

- Free mint / adminMint as product authority  
- Third-party custody vaults as AST core  
- Treating ERC balances as canonical supply  
