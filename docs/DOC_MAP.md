# Document Map

**Status:** Structure ratified (2026-07-14); aligned to Core Canon v1.0 Final (2026-07-16)  
**Principle:** [ANTI_POLICE.md](./principles/ANTI_POLICE.md)  
**Canon:** `/CANON.md` (AST Core Canon — sole source of truth)

Registry of canonical components, their documentation packs, and target code paths.

---

## Sources of truth

1. `CANON.md` — **AST Core Canon v1.0 Final** (sole source of truth)  
2. `docs/` — specifications derived from canon  
3. `src/` — implementation (must conform; if code and docs diverge from canon, fix them)

---

## Root docs

| Path | Status | Role |
|------|--------|------|
| `CANON.md` | exists | Canon spine |
| `docs/README.md` | exists | Docs entry |
| `docs/ARCHITECTURE.md` | scaffold | End-to-end view |
| `docs/DOC_MAP.md` | exists | This registry |
| `docs/principles/ANTI_POLICE.md` | exists | Working rule |
| `docs/components/_template/` | exists | Pack template |

---

## Canonical components (`src/` — CANON §3)

Unit of documentation = **runtime component**. Layer folders (`02_…`, `10_…`) from migration plans may map later; they are not required to create a pack.

| Priority | Component | Docs pack | Pack status | Target code | Notes |
|----------|-----------|-----------|-------------|-------------|--------|
| P0 | `invariants` | `components/invariants/` | **ready** | `src/invariants/` | I1–I9; assert+checkAll+InvariantBroken |
| P0 | `pot` | `components/pot/` | **ready** | `src/pot/` | Sole gate for value; M-of-N; no amount math |
| P0 | `aroscoin` | `components/aroscoin/` | **ready** | `src/aroscoin/` | ARO/9; emission-after-PoT only |
| P0 | `reserve` | `components/reserve/` | **ready** | `src/reserve/` | Own funds; bag accounting; reserveIndex |
| P1 | `nodechain` | `components/nodechain/` | missing | `src/nodechain/` | Process graph / sole SoT ledger |
| P1 | `nodes` | `components/nodes/` | missing | `src/nodes/` | Register / auth / validators |
| P1 | `emission` | `components/emission/` | missing | `src/emission/` | Amounts from institutional valuation + ΔValue |
| P1 | `commission` | `components/commission/` | missing | `src/commission/` | Post-factum fee / settlement |
| P1 | `all-seeing-eye` | `components/all-seeing-eye/` | missing | `src/all-seeing-eye/` | Observe / notify only — no veto, no rollback |
| P2 | `orchestrator` | `components/orchestrator/` | missing | `src/orchestrator/` | Coordinates only (not PoT quorum) |
| P2 | `state-recording` | `components/state-recording/` | missing | `src/state-recording/` | State recording |
| P2 | `release` | `components/release/` | missing | `src/release/` | Release Phase + release paths |
| P3 | `common` | `components/common/` | missing | `src/common/` | Shared utilities |

Pack status values: `missing` | `draft` | `ready` | `implemented`.  
P0 packs are **ready** (owner answers canonical, 16 July 2026 Core Canon). P1–P3 remain **missing**.

---

## Pack contents (fixed)

Every component folder uses exactly:

```
PURPOSE.md
MODEL.md
CONTRACT.md
ACCEPTANCE.md
```

Copy from `components/_template/`. Do not expand the set without product-owner request.

---

## Optional later mapping (not blocking)

| Migration / target layer | Primary components |
|--------------------------|--------------------|
| `02_nodechain_engine` | `nodechain`, `nodes`, `state-recording` |
| `03_token_management_layer` | `aroscoin`, `emission`, `release` |
| `08_fee_distribution` | `commission` |
| `10_proof_of_transaction_engine` | `pot` |
| `13_extra_supervisory_layer` | `all-seeing-eye` |
| `15_reserve` | `reserve` |
| `06_governance_layer` | AI hierarchy (see CANON); not a police layer |
| `07_processing_layer` | `orchestrator` + pipeline |
| `14_decentralized_tx_encoding` | encoding utilities (may live under `common` or `nodechain`) |

---

## Build order (docs first for P0)

1. `invariants`  
2. `pot`  
3. `reserve`  
4. `aroscoin`  
5. Then P1 → P2 → P3  

Code for a component follows its pack when the pack is sufficient to implement without guessing canon.
