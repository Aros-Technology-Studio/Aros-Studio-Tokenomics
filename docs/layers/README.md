# AST layers

Documentation by **numbered layers**. Content is written with the product owner.  
Code follows only after the relevant layer specs exist.

## Layer index

| ID | Path | Role |
|----|------|------|
| **01** | [`01_NodeChain/`](01_NodeChain/) | Sole source-of-truth ledger (journal, snapshots, append) |

Further layers (PoT, token, …) will be added as `02_…`, `03_…` when named by the owner.

## Rules

1. Owner is the legislative authority for canon and layer design.  
2. Each layer states **in / out of scope** in its README.  
3. Supra-layers (e.g. All-Seeing Eye) are not buried inside `01_NodeChain` as modules.  
4. Portal / UI is out of product scope unless the owner re-opens it.  
