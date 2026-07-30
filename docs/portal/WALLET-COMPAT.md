# Wallet compatibility (representation layer)

## Principle (Canon)

- **SoT:** NodeChain + PoT (internal ARO accounting).  
- **Wallets / ERC-20 / ERC-721:** *representation adapters* — not free mint authority.  
- Portal **never** mints ARO on-chain.

## What ships now

| Export | Wallet / dApp use |
|--------|-------------------|
| Certificate **QR** | Scannable HTTPS verify URL (`/explore?processId=…`) + `ast=certificate-v1` |
| `walletCompat.erc721Metadata` | OpenSea / wallet NFT metadata shape |
| `walletCompat.eip681` | `ethereum:0x…@chainId` when holder wallet bound |
| `walletCompat.caip19` | Multi-chain asset id (`ast:nodechain/process:…` until adapter) |
| Optional **holderWallet** | Bound on certificate for MetaMask-style address |

## Wizard

Step “From document”: optional field **Crypto wallet** (`0x` + 40 hex).

## Env (adapters later)

| Variable | Role |
|----------|------|
| `AST_PUBLIC_PORTAL_ORIGIN` | Absolute URLs in QR (e.g. `https://portal.example.com`) |
| `AST_REPRESENTATION_CHAIN_ID` | Default `1` (Ethereum mainnet id for CAIP) |
| `AST_ARO_VIEW_CONTRACT` | Optional deployed `ArosCoinView` (tip attest only — **not** ERC mint SoT) |

Deploy / report: `docs/contracts/SOLIDITY-BLOCK-E.md` · `npm run contracts:deploy` · `npm run contracts:report-tip`.

## Not done (follow-on)

- Live ERC-20/3643 contract mint from Core  
- WalletConnect sign of certificate  
- Bridging SoT balances to L1 as authority  

See `contracts/README.md` — representation only.
