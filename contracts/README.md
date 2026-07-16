# Contracts — representation only

**AST Token Protocol** lives in NodeChain + PoT (TypeScript core).  
Solidity here is for **external representation adapters**, not source of truth.

## Layout

```
contracts/
  representation/
    ArosCoinView.sol    # view-oriented ERC-20 style surface (no free mint)
  foundry.toml          # optional Foundry config stub
```

## Rules

- Privileged mint paths are forbidden forever  
- No third-party custody vault  
- Critical mint/burn/transfer of **canonical** value stays in `src/` after PoT + NodeChain  
- Align with `src/adapters/erc20-representation.adapter.ts`

## Tooling (optional)

```bash
# if Foundry installed
forge build
```

v1 CI does not require forge; TypeScript adapters and tests are authoritative for core.
