# E2 — ArosCoinView testnet deploy + reporter keys

**Not production mainnet mandate.** Testnet / private chain for explorers.  
**Contract does not mint.** Reporter only attests journal tip hash + height.

---

## Prerequisites

| Tool | Check |
|------|--------|
| Foundry | `forge --version` · `cast --version` |
| RPC | Sepolia / local Anvil / other EVM |
| Deployer key | funded for gas |
| Reporter address | will call `attestJournalTip` |

Generate a dedicated reporter key (do **not** reuse institution portal salt):

```bash
cast wallet new
# save address + private key in a secrets manager — never commit
export REPORTER=0x…          # address
export REPORTER_PK=0x…       # private key for report-tip only
export DEPLOYER_PK=0x…       # may equal REPORTER_PK on testnet
export RPC_URL=https://…     # or http://127.0.0.1:8545
```

---

## Deploy

### A. npm helper (recommended)

```bash
export RPC_URL=…
export DEPLOYER_PK=…
export REPORTER=0x…          # constructor arg

npm run contracts:deploy
# prints deployed address → export ARO_VIEW=0x…
```

### B. forge build + cast create

(`forge create` may mis-parse constructor args on some Foundry builds; cast create is the supported path.)

```bash
cd contracts && forge build
BYTECODE=$(python3 -c "import json; print(json.load(open('out/ArosCoinView.sol/ArosCoinView.json'))['bytecode']['object'])")
ARG=$(cast abi-encode 'constructor(address)' "$REPORTER")
cast send --rpc-url "$RPC_URL" --private-key "$DEPLOYER_PK" \
  --create "${BYTECODE}${ARG#0x}"
```

### C. Local Anvil smoke

```bash
anvil &
export RPC_URL=http://127.0.0.1:8545
export DEPLOYER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export REPORTER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
npm run contracts:deploy
```

---

## Verify on-chain

```bash
cast call $ARO_VIEW "reporter()(address)" --rpc-url $RPC_URL
cast call $ARO_VIEW "name()(string)" --rpc-url $RPC_URL
cast call $ARO_VIEW "lastJournalHeight()(uint256)" --rpc-url $RPC_URL
```

---

## Key roles

| Role | Privilege |
|------|-----------|
| **Deployer** | Pays gas once; no special on-chain role after deploy |
| **Reporter** | Only address that may `attestJournalTip` / `setReporter` |
| **Anyone else** | Read tip/height; **cannot** mint |

Rotate reporter:

```bash
cast send $ARO_VIEW "setReporter(address)" $NEW_REPORTER \
  --rpc-url $RPC_URL --private-key $REPORTER_PK
```

---

## Env summary

| Variable | Use |
|----------|-----|
| `RPC_URL` | JSON-RPC |
| `DEPLOYER_PK` | deploy tx |
| `REPORTER` | constructor initial reporter |
| `REPORTER_PK` | E3 attest txs |
| `ARO_VIEW` / `AST_ARO_VIEW_CONTRACT` | deployed address |

---

## Acceptance (E2)

| Check | Evidence |
|-------|----------|
| Runbook | this file |
| Deploy script | `scripts/contracts-deploy.sh` |
| Keys documented | roles table above |
| Mainnet prod path | **Owner residual** (not required for E2 Done) |
