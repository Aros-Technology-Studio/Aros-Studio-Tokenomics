# Document Map

**Status:** Structure ratified (2026-07-14)  
**Principle:** [ANTI_POLICE.md](./principles/ANTI_POLICE.md)

Registry of canonical components, their documentation packs, and target code paths.

---

## Sources of truth

1. `CANON.md` — ratified canon  
2. `docs/` — specifications derived from canon  
3. `src/` — implementation (wins over stale specs when they diverge; then specs must be fixed)

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

| Priority | Component | Docs pack | Target code | Notes |
|----------|-----------|-----------|-------------|--------|
| P0 | `invariants` | `components/invariants/` | `src/invariants/` | System-wide truths; links CANON §12 |
| P0 | `pot` | `components/pot/` | `src/pot/` | Sole cause of emission / confirmation |
| P0 | `aroscoin` | `components/aroscoin/` | `src/aroscoin/` | Mint / burn / bound claim |
| P0 | `reserve` | `components/reserve/` | `src/reserve/` | 1:1 binding under ArosCoin |
| P1 | `nodechain` | `components/nodechain/` | `src/nodechain/` | Process graph / ledger |
| P1 | `nodes` | `components/nodes/` | `src/nodes/` | Register / auth |
| P1 | `emission` | `components/emission/` | `src/emission/` | PoT formula `T_E = α·TV + β·U + γ` |
| P1 | `commission` | `components/commission/` | `src/commission/` | Commission model (e.g. 75/25 when canon applies) |
| P1 | `all-seeing-eye` | `components/all-seeing-eye/` | `src/all-seeing-eye/` | Observe + veto only |
| P2 | `orchestrator` | `components/orchestrator/` | `src/orchestrator/` | Process orchestration |
| P2 | `state-recording` | `components/state-recording/` | `src/state-recording/` | State recording |
| P2 | `release` | `components/release/` | `src/release/` | Release / return path |
| P3 | `common` | `components/common/` | `src/common/` | Shared utilities |

Pack status values: `missing` | `draft` | `ready` | `implemented`.  
At ratification of this map, all packs are **missing** except `_template/`.

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
