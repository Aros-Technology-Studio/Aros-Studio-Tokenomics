# Audit queries

## Minimum audit checks

| Check | Question |
|-------|----------|
| Chain integrity | Does prevHash walk genesis→tip? |
| Process completeness | Are all stages for processId present? |
| Write-ahead sample | Do economic facts post-date their pot_verdict records? |
| Writer auth | Are writers in allowlist at that height? |
| Snapshot fidelity | Does snapshot match replay? |

## Export

Auditors receive height ranges + optional Merkle/hash proofs, not mutable DB dumps as SoT.
