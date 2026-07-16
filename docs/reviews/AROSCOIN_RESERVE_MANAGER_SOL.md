# Review: ArosCoinReserveManager.sol (legacy / external)

**Status:** Review complete for AST v1 posture  
**Issue:** #43  
**Canon:** Selective custody own funds only; ERC adapters not SoT (§VI, §4.4, I6)

---

## Finding

Any Solidity “reserve manager” that:

- holds **participant / client** funds, or  
- mints on deposit / burns on withdrawal as **custodial** backing, or  
- treats ERC balances as sole truth  

is **incompatible** with standalone AST Core Canon (Model of own-funds process economy).

## AST v1 allowed surface

| Allowed | Forbidden |
|---------|-----------|
| View-only / representation adapters | Mint-on-deposit for third-party funds |
| Mirrors of NodeChain state for external UX | Protocol SoT on-chain without PoT+NodeChain |
| AST **own** reserve bag accounting in `src/reserve` | Third-party custody vault product |

## Disposition

- **Do not port** custodial `ArosCoinReserveManager` semantics into AST core.  
- Use `src/adapters/erc20-representation.adapter.ts` + `contracts/representation/` for external compatibility only.  
- If a historical `.sol` appears in migration inbox, gate it with `migration-doc-gate` / human DROP or REWRITE.

## Sign-off (engineering)

Reviewed against Core Canon 2026-07-16: **reject custodial backing pattern**; keep reserve as AST own books + NodeChain SoT.
