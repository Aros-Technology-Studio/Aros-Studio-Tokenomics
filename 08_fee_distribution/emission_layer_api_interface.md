# emission_layer_api_interface.md

## Module: Fee / Commission Layer API Interface

- **Layer**: Fee / Commission Layer — AST (Aros Studio Tokenomics)
- **Stands on**: I1 (PoT-gated origin), I5 (determinism), I7 (Eye veto), I8 (append-only causality), I6 (no speculative surface)

---

## Overview

This module defines the interface through which components interact with the Fee / Commission Layer. AST is service-to-service; there is no public end-user surface. The interface does two things and only two: it lets a node **submit a confirmed cause** (a process carrying a `verified === 1` verdict) for execution, and it lets any authorized reader **reconstruct the recorded record**.

The interface exposes **no endpoint that can cause a unit to exist without a PoT verdict, no endpoint that mints, reissues, or reinstates supply, and no discretionary override**. Those would name causes the model does not have (I1) or powers the model gives to no one (I7). The only halt available is the circuit breaker, which stops steps — it never creates them.

---

## API categories

| Category | Description | Nature |
|---|---|---|
| Emission Query | Returns the recorded emission for a process or epoch. | Read-only |
| Epoch Summary | Returns a settlement snapshot (settled commission, 75/25 split). | Read-only |
| Cause Submission | A node submits a completed process carrying its recorded `verified === 1` verdict. | Confirms a cause; never grants one |
| Audit Read | Full reconstruction with Merkle inclusion proofs. | Read-only |

There is no "governance override" category. The power to freeze belongs to the circuit breaker (I7); the power to set `COMMISSION_RATE` within `[0, 0.01]` belongs to the role-based committee and is exercised by a recorded, on-chain parameter change (I8) — not by an API mint or reinstate.

---

## Key endpoints

### GET `/emission/{process_id}`

Returns the recorded emission for a process.

```json
{
  "process_id": "P-91239",
  "emission_id": "EM-10023",
  "epoch_id": 195,
  "status": "finalized",
  "process_part_minted_arx": 88000000000,
  "process_part_burned_arx": 88000000000,
  "commission_arx": 440000000,
  "node_pool_arx": 330000000,
  "system_reserve_arx": 110000000
}
```

### GET `/emission/epoch/{epoch_id}`

Returns the settlement snapshot for an epoch.

```json
{
  "epoch_id": 195,
  "settled_commission_arx": 438200000000,
  "node_pool_arx": 328650000000,
  "system_reserve_arx": 109550000000,
  "status": "closed",
  "state_hash": "0x8ae45c..."
}
```

### POST `/emission/submit`

A node submits a completed process together with its recorded PoT verdict. The layer **confirms the cause** and executes the mint / commission / burn deterministically (I5); it never manufactures a cause. If no `verified === 1` verdict is recorded for the process, the call throws `E_NO_VERDICT` and nothing changes.

```json
POST /emission/submit
{
  "process_id": "P-98100",
  "verdict_ref": "VD-98100-1",
  "node": "ND-14"
}
```

Response:

```json
{
  "emission_id": "EM-11288",
  "status": "finalized",
  "process_part_minted_arx": 73500000000,
  "commission_arx": 367500000,
  "node_pool_arx": 275625000,
  "system_reserve_arx": 91875000
}
```

Submitting the same `verdict_ref` twice is idempotent: the second call returns the existing `emission_id` and causes no second mint (I5, I8).

### There is deliberately no `POST /emission/override`

An earlier draft exposed an override endpoint to freeze, correct, or reinstate emissions by governance authority. **It is removed.** Reinstating or correcting supply by fiat would create or move units with no PoT-verdict cause (I1), and no role — not even the All-Seeing Eye — holds a generative power (I7). The legitimate needs it tried to serve are met without it:

- To **stop** a bad step: the Eye vetoes it, or the circuit breaker halts the layer (see `emission_rollbacks_and_freeze_rules.md`). A stop creates nothing.
- To **re-run** a settlement after a halt: replay the recorded causes (deterministic, I5) — same effects, no new units.
- To **adjust** `COMMISSION_RATE`: the committee records a bounded change on-chain before effect (I8).

---

## Access and identity

| Role | Permissions |
|---|---|
| Node | Submit a confirmed cause; read own and others' records. |
| Role-based committee | Read; record a bounded `COMMISSION_RATE` change (on-chain, before effect). |
| Auditor | Full read + deterministic replay for verification. |
| All-Seeing Eye | Observe every step; veto any that would violate I1–I6. Initiates nothing. |

- Zero-trust transport: service identity via mutual TLS; no public endpoints.
- No role can mint, reissue, or reinstate — a held ARO balance confers no authority (I6).

---

## Rate limits

- `/emission/submit`: bounded per node (throughput control, not an economic cap).
- Read endpoints: rate-limited per client.

Rate limits govern request throughput only; they never alter emission amounts, which are fixed by the invariants.

---

## Dependencies

- `emission_flow_pipeline.md` — what `/emission/submit` executes
- `emission_reporting_and_traceability.md` — what the read endpoints return
- `epoch_allocation_model.md` — the epoch summary shape
- `emission_rollbacks_and_freeze_rules.md` — the halt semantics (the only "override")

---

## Next

→ See [`emission_rollbacks_and_freeze_rules.md`](./emission_rollbacks_and_freeze_rules.md) for how a vetoed or halted cause is prevented from producing a lasting effect.
