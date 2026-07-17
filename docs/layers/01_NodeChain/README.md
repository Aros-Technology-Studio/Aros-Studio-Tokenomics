# 01_NodeChain

**Layer number:** `01` (first core layer)  
**Path:** `docs/layers/01_NodeChain/`  
**Status:** **Documentation complete (v1 draft)** — owner may amend  
**Role:** Sole **source of truth ledger** for significant events in AST

---

## What this layer is

NodeChain is the append-only causal journal of AST with cryptographic chaining and ExecutionSnapshots.  
A significant event is valid only if it is recorded here.

## What this layer is not

| Not here | Elsewhere |
|----------|-----------|
| PoT P1–P4 / verdict logic | PoT layer |
| ASE AI hierarchy / control policy | ASE supra-layer (observes via event stream) |
| Mint/burn/ΔValue math | Token / emission |
| Commission split formulas | Settlement |
| UI | out of scope |

---

## Directory map

```text
01_NodeChain/
├── README.md
├── 00_scope/                 purpose, non-goals, boundaries
├── 01_ledger/                journal core ★
├── 02_identity_and_nodes/    roles, auth, suspension
├── 03_crypto/                at-rest, transport, signatures
├── 04_transaction_and_process_binding/
├── 05_network/               replication, ordering, faults
├── 06_storage/               RocksDB primary, mirror
├── 07_integrity_and_audit/   replay, codes, ASE hooks
├── 08_api/                   append / query / snapshot / events
├── 09_acceptance/            criteria, tests
└── diagrams/
```

## Sources used

- Core Canon §4.1 NodeChain, write-ahead / SoT principles  
- P0–P4 nodechain & nodes decisions  
- Prior paradigm `02_nodechain_engine` **selectively**: append-only causality, ExecutionSnapshot, identity-not-stake, 2/3 append quorum idea, fault replay-only, mTLS  
- **Not carried in:** shard-mesh as v1 core, PoT-inside-NodeChain, Eye veto as ledger API, 75/25 payment engine, Rust-as-required runtime  

## Next layer

After owner sign-off on `01_NodeChain`, define **`02_…`** (expected: PoT).
