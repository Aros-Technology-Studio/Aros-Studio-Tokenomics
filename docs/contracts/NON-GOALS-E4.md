# E4 — Explicit non-goals (Canon)

**Status:** Out of scope forever for this representation surface.

| Forbidden | Why |
|-----------|-----|
| Free mint / `adminMint` as product authority | Canon: mint only after PoT on Core |
| Treating ERC-20 balances as canonical ARO supply | NodeChain journal is SoT |
| Portal or wallet adapter minting ARO | Portal edge never mints |
| Third-party custody vault as AST core | Hard prohibition |

`ArosCoinView` only stores **attested journal tip** for explorers.  
Canonical balances live in `src/aroscoin` / TokenService after PoT.

Guards: `npm run check:canon` · token-protocol / no-bypass PoT.
