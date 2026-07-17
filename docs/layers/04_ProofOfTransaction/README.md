# 04_ProofOfTransaction

**Status:** v1 draft + code `src/pot`  
**Issue:** LAYER 04 proof_of_transaction  
**Role:** Sole value gate — P1–P4 + confirmer quorum → `verified` 0|1; journal `pot_evidence` + `pot_verdict` **before** mint.

## Criteria (Core Canon)
| ID | Rule |
|----|------|
| P1 | Institution allowlisted / allowed context |
| P2 | Required stages completed |
| P3 | Significant states on NodeChain |
| P4 | Process-type rules (docs, signature, valuation present) |

Quorum: ceil(2/3·K), K≥3. No amount math in PoT.
