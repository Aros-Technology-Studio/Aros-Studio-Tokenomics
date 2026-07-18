# Purpose — PoT

AST may recognize value **only** as the consequence of a PoT verdict `verified = 1` for a specific process.

This layer exists to:

1. Decide whether a process is **admissible** for a positive verdict (P1–P4).  
2. Collect **quorum attestation** from eligible confirmers (not stake).  
3. **Record** evidence and verdict on NodeChain immutably.  
4. Provide a **final** positive verdict that emission and settlement may consume.

Without this gate, free mint and bypass paths become possible — both are hard-forbidden by Core Canon.
