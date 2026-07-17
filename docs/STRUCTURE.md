# STRUCTURE — layer numbering map

Derived from GitHub issue titles (LAYER 01–10) and owner renumber of NodeChain as **01**.

| ID | Path | Issue titles (guidance) | Status |
|----|------|-------------------------|--------|
| **01** | `docs/layers/01_NodeChain/` + `src/nodechain/` | LAYER 01 nodechain | Docs + **journal code** (genesis + first record) |
| **02** | `docs/layers/02_TxEncoding/` | LAYER 02 tx_encoding | Skeleton |
| **03** | `docs/layers/03_Processing/` | LAYER 03 processing | Skeleton |
| **04** | `docs/layers/04_ProofOfTransaction/` | LAYER 04 proof_of_transaction | Skeleton |
| **05** | `docs/layers/05_TokenManagement/` | LAYER 05 token_management | Skeleton |
| **06** | `docs/layers/06_FeeCommission/` | LAYER 06 fee_commission 70/30 | Skeleton |
| **07** | `docs/layers/07_Reserve/` | LAYER 07 reserve (AST own) | Skeleton |
| **08** | `docs/layers/08_AllSeeingEye/` | LAYER 08 ASE observe/notify | Skeleton |
| **09** | `docs/layers/09_Governance/` | LAYER 09 AI hierarchy, no voting | Skeleton |
| **10** | `docs/layers/10_AssetTokenization/` | LAYER 10 asset_tokenization | Skeleton |

## Out of scope (issue titles acknowledged)

| Title theme | Decision |
|-------------|----------|
| Issuer Portal / INTERFACE | **Out of scope** (owner) |
| Rust workspace | TS/Nest first; not required for journal v0.1 |
| 20/80 commission | Closed as **70/30** ship default |

## ENV checklist (from issues)

| Item | Status |
|------|--------|
| NestJS/TS workspace | yes |
| editorconfig / gitignore / LICENSE | yes |
| CI minimal | yes |
| Docker | later |
| Postgres schema | later (index mirror) |
| Solidity | later (representation only) |
