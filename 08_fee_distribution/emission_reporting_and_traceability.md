# emission_reporting_and_traceability.md

## Module: Emission Reporting & Traceability

- **Layer**: Fee / Commission Layer — AST (Aros Studio Tokenomics)
- **Stands on**: I5 (determinism), I8 (append-only causality), I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment for confirmed work), I4 (reserve is AST's own)

---

## Overview

This module defines how every emission and commission movement is recorded so that it is **reproducible** from NodeChain (I5). Traceability here is not an added policy; it is the direct expression of two invariants: every cause is appended before its effect (I8), and every effect follows deterministically from its recorded causes (I5). Given the record, any node can reconstruct the exact sequence — mint, commission, split, burn — for any process, at any time.

---

## Emission record structure

Each finalized emission generates a structured entry:

| Field | Description | Anchors to invariant |
|---|---|---|
| `emission_id` | Unique identifier of the emission event. | — |
| `process_id` | The process whose `verified === 1` verdict caused the mint. | I1 |
| `epoch_id` | Settlement window the commission was batched into. | — |
| `process_part_minted_arx` | Process part minted, equal to `A`. | I1, I2 |
| `process_part_burned_arx` | Process part burned at cycle close, equal to `A`. | I2 |
| `commission_arx` | `A × COMMISSION_RATE`, in ARO. | I3 |
| `node_pool_arx` | 75% of commission → `SYSTEM_NODE_POOL`. | I3 |
| `system_reserve_arx` | 25% of commission → `SYSTEM_RESERVE`. | I4 |
| `node_weights` | PoT-normalized weights used to sub-distribute the node pool. | I3 |
| `verdict_ref` | Reference to the recorded PoT verdict (the cause). | I1, I8 |
| `hash_link` | Hash pointing to the full record. | I8 |
| `signature` | Signature of the node that recorded the event. | I8 |
| `recorded_at` | UTC time of finalization. | — |

The record carries `process_part_minted_arx` **and** `process_part_burned_arx` precisely so an auditor can confirm `minted == burned` (I2) without leaving the record.

---

## Hash anchoring

Emissions are hash-linked in a Merkle tree per epoch:

- The hash root over all emissions in an epoch is computed at window close.
- The root is committed into NodeChain at settlement (I8).
- Any observer can verify an emission's inclusion via its Merkle path to the committed root, without needing private process data.

Because the root is a pure function of the recorded causes, recomputing it on any node yields the same value (I5). A mismatch is a detectable integrity fault, not a matter of opinion.

---

## What the record must let an auditor prove

Auditing is the restatement of the invariants as checks over the record:

- **Cause before mint (I1, I8):** every `process_part_minted_arx` is preceded by a recorded `verified === 1` verdict referenced by `verdict_ref`.
- **Supply conservation (I2):** for every completed process, `process_part_minted_arx == process_part_burned_arx`.
- **Commission math (I3):** `commission_arx == round(A × COMMISSION_RATE)` at the rate in force, and `node_pool_arx + system_reserve_arx == commission_arx`.
- **Two shares only (I3, I4):** commission routes only to `SYSTEM_NODE_POOL` and `SYSTEM_RESERVE`; no third destination appears.
- **Reserve is internal (I4):** `system_reserve_arx` accrues only to `SYSTEM_RESERVE`.
- **Idempotency (I5, I8):** replaying a `verdict_ref` produces no second emission.

---

## Audit streams

Emission records are published to append-only destinations:

- Node-local emission logs (append-only, I8);
- Cross-node emission hash registry (for inclusion proofs);
- Read-only aggregate audit surface (hashed identifiers; exposes the record, never a control).

None of these can author, alter, or reissue an emission — they read the causal record. Publication is disclosure of what already happened, not a step in causing it.

---

## Example record

```json
{
  "emission_id": "EM-19483",
  "process_id": "P-843291",
  "epoch_id": 195,
  "process_part_minted_arx": 112750000000,
  "process_part_burned_arx": 112750000000,
  "commission_arx": 563750000,
  "node_pool_arx": 422812500,
  "system_reserve_arx": 140937500,
  "verdict_ref": "VD-843291-1",
  "hash_link": "0xaabbcc...",
  "signature": "0xBASE64...",
  "recorded_at": 1720251322
}
```

---

## Verifiability tools

- Nodes publish Merkle paths from an emission to its epoch root.
- The verification routine (recompute `commission = A × rate`, check the 75/25 split, check `minted == burned`) is deterministic and reproducible on any node (I5).
- Epoch-level summaries expose `settled_commission_arx` and its 75/25 split as an aggregate of the per-process records they summarize.

---

## Integration points

- `emission_flow_pipeline.md` — produces the movements this module records
- `epoch_allocation_model.md` — provides the per-epoch settlement snapshot
- `emission_layer_api_interface.md` — exposes read-only access to the record
- `01_coin_engine/burn_and_mint_rules.md` — the failure codes an audit asserts against

---

## Next

→ See [`emission_layer_api_interface.md`](./emission_layer_api_interface.md) for how components submit a cause and read the emission record.
