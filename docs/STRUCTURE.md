# STRUCTURE — layer map

| ID | Path | Code | Status |
|----|------|------|--------|
| 01 | docs/layers/01_NodeChain | src/nodechain | append-only journal (memory/file/rocksdb) |
| — | Core Canon §XI | src/invariants | I1–I9 fail-closed + ok-to-emit |
| — | common money / processId | src/common | decimal ARO + AST processId |
| 02 | docs/layers/02_TxEncoding | src/tx-encoding | done v1 |
| 03 | docs/layers/03_Processing | src/processing | done v1 |
| 04 | docs/layers/04_ProofOfTransaction | src/pot | P1–P4 + journal before ok-to-emit |
| 05 | docs/layers/05_TokenManagement | src/token + src/aroscoin | ARO mint/burn PoT-gated |
| — | emission | src/emission | valuation / ΔValue → ArosCoin |
| 06 | docs/layers/06_FeeCommission | src/commission | post-factum 70/30 |
| 07 | docs/layers/07_Reserve | src/reserve | own funds + reserveIndex |
| — | orchestrator | src/orchestrator | sole-entry happy path |
| 08 | docs/layers/08_AllSeeingEye | src/all-seeing-eye | done v1 |
| 09 | docs/layers/09_Governance | src/governance | done v1 |
| 10 | docs/layers/10_AssetTokenization | src/intake | done v1 |

Portal edge scaffold: `portal/` + `docs/portal/` (not SoT).

## Open backlog (must not drop)

See [`docs/BACKLOG.md`](BACKLOG.md) and issues **#68–#70**:

1. HSM key provider  
2. Network replication  
3. Formal L3 LLM adapters  
