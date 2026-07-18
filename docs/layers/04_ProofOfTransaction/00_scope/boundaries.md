# Boundaries — PoT

## Upstream

| Source | Input |
|--------|--------|
| Processing (03) | `ProcessState` / process stages |
| NodeChain (01) | History by processId, tip hashes |
| Governance / intake | Allowlist and document flags (via process_open payload) |
| Nodes | Confirmer identities + signatures |

## Downstream

| Consumer | Use of verdict |
|----------|----------------|
| Token (05) | Mint only if `verified=1` and ledger height known |
| Commission (06) | Settle only after pot |
| ASE (08) | Observe reason codes / failures |
| L3 governance | pot_consistency agent |

## Hard rules

1. PoT **must not** mint or pay.  
2. Token **must not** mint without journaled `pot_verdict` with `verified=1`.  
3. Orchestrator coordinates; confirmers attest; PoT evaluates.  
