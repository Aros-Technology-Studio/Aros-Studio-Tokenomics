# Test plan — PoT

| Case | Expect |
|------|--------|
| Happy P1–P4 + quorum 3/3 | verified=1 |
| Allowlist false | verified=0, P1 code |
| Missing docs/signature | verified=0, P4 codes |
| Confirmers 1 of 3 | verified=0, QUORUM_SHORT |
| K=2 validators | verified=0, QUORUM_K_BELOW_MIN |
| Open older than 15m | verified=0, POT_TIMEOUT |
| Second verify after final 1 | throws POT_ALREADY_FINAL |
| pot_evidence then pot_verdict heights ordered | evidence height < verdict height |
| Replay criteria pure | same inputs → same criteriaResult |
