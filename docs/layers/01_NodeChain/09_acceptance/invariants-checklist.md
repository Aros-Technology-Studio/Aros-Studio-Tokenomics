# Invariants checklist (ledger-facing)

Map to Core Canon concepts; NodeChain enforces the **recording** side.

| Check | How NodeChain supports it |
|-------|---------------------------|
| Significant event recorded | append required for facts; validity V-rules |
| Determinism | pure replay from journal |
| Append-only causality / write-ahead | write-path + caller discipline |
| No speculative stake gate | registration without capital |
| Selective custody | N/A directly; no custody APIs here |
| ASE observation | events-out hooks |

Implementation CI should automate chain verify + immutability tests when code exists.
