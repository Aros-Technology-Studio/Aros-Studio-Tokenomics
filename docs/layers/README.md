# AST layers (01–10)

| ID | Path | Code | Issue map |
|----|------|------|-----------|
| 01 | [01_NodeChain](01_NodeChain/) | `src/nodechain` | #18 #55 |
| 02 | [02_TxEncoding](02_TxEncoding/) | `src/tx-encoding` | #56 |
| 03 | [03_Processing](03_Processing/) | `src/processing` | #20 #57 |
| 04 | [04_ProofOfTransaction](04_ProofOfTransaction/) | `src/pot` | #21 #67 |
| 05 | [05_TokenManagement](05_TokenManagement/) | `src/token` | #22 #66 |
| 06 | [06_FeeCommission](06_FeeCommission/) | `src/commission` | #23 #65 |
| 07 | [07_Reserve](07_Reserve/) | `src/reserve` | #24 #64 |
| 08 | [08_AllSeeingEye](08_AllSeeingEye/) | `src/eye` | #25 #63 |
| 09 | [09_Governance](09_Governance/) | `src/governance` | #26 #62 |
| 10 | [10_AssetTokenization](10_AssetTokenization/) | `src/intake` | #27 #40 |

Full mapping: [LAYER_ISSUE_MAP.md](LAYER_ISSUE_MAP.md)

## Pipeline

```bash
npm test
npm run demo:tokenize -- --dir data/journal-rocks --engine rocksdb
```

Portal / Issuer UI is **not** a layer in this map (out of scope).
