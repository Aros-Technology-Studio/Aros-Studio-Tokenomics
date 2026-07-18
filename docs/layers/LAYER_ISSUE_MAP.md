# LAYER issue map

Canonical folder numbering uses **01–10**. GitHub titles used mixed 01/04 numbering — this table is the SoT mapping.

| Layer folder | Code | GitHub issues (titles) | Status |
|--------------|------|------------------------|--------|
| `01_NodeChain` | `src/nodechain` | #18, #55 LAYER 01 nodechain | implemented |
| `02_TxEncoding` | `src/tx-encoding` | #56 LAYER 02 tx_encoding | implemented |
| `03_Processing` | `src/processing` | #20, #57 LAYER 03 processing | implemented |
| `04_ProofOfTransaction` | `src/pot` | #21, #67 LAYER 04 PoT | implemented |
| `05_TokenManagement` | `src/token` | #22, #66 LAYER 05 token | implemented |
| `06_FeeCommission` | `src/commission` | #23, #65 LAYER 06 fee 70/30 | implemented |
| `07_Reserve` | `src/reserve` | #24, #64 LAYER 07 reserve | implemented |
| `08_AllSeeingEye` | `src/all-seeing-eye` | #25, #63 LAYER 08 All-Seeing Eye | implemented |
| `09_Governance` | `src/governance` | #26, #62 LAYER 09 governance | implemented |
| `10_AssetTokenization` | `src/intake` | #27, #40 LAYER 10 | implemented |

## Out of series (not layers)

| Issue | Handling |
|-------|----------|
| #28, #39 Issuer Portal | **Out of scope** — do not implement as layer |
| #35 CANON root | Core Canon + CI gates (ENV/guards), not a runtime layer |

## Acceptance command

```bash
npm test
npm run check:canon
npm run demo:tokenize -- --dir /tmp/ast-layer --engine rocksdb
```
