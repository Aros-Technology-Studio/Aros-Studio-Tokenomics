# Boundaries

| Calls | Does not |
|-------|----------|
| TxEncoding (`EncodingService.encode`) | Mint / burn / transfer |
| NodeChain append/query | PoT P1–P4 evaluation |
| In-memory process map + hydrate | Commission / reserve math |
| Hands `ProcessState` to orchestrator / PoT | L1–L3 policy decisions |

Orchestrator (`TokenizationPipeline`) sequences: Processing → PoT → Token → Commission → Reserve.
