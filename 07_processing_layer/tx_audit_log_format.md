# tx_audit_log_format.md

## Module: Transaction Audit Log Format

**Stands on:** I8 (append-only causality), I7 (Eye veto), I5 (determinism), I1 (PoT-gated origin), I6 (no speculative surface). See `README.md` §1.

## Overview

The audit log is the **system-level** append-only record of security-relevant events: guardrail vetoes, validation anomalies, rollback incidents, snapshot faults, and any attempt to violate an invariant. Where the journal (`tx_journal_writer.md`) mirrors each individual candidate's lifecycle, the audit log records the events that concern the **integrity of the layer as a whole**. Both are direct expressions of I8: every cause is appended before its effect is acknowledged.

The audit log is where the All-Seeing Eye's observations and vetoes live (I7). *Because* the Eye's power is strictly negative, the log contains only observations and halts — **never** a mint, burn, or payment; an entry that recorded one would itself be an I7 violation and is rejected by audit.

---

## Purpose

- Record events affecting candidate-process integrity across the layer.
- Preserve a traceable lineage for rollback and dispute resolution.
- Capture every guardrail veto and invariant-defense event (I7).
- Support cross-node consistency verification from recorded causes (I5).

---

## Audit log schema

| Field | Description |
|---|---|
| `log_id` | Globally unique id of the audit event. |
| `tx_id` | Associated candidate process, if any. |
| `event_type` | One of: `validation_error`, `rollback`, `guardrail_veto`, `invariant_defense`, `system_fault`. |
| `node_id` | Node that generated the event. |
| `timestamp` | Event time. |
| `severity` | One of: `info`, `warning`, `critical`. |
| `invariant` | The invariant defended (e.g. `I6`), where applicable. |
| `details` | System message. |
| `snapshot_ref` | Snapshot reference, if candidate-related. |
| `hash_chain_prev` | Hash of the previous audit entry (per node). |
| `hash_current` | Hash of this entry (chain integrity). |
| `signature` | Node signature over the record. |

```json
{
  "log_id": "AL-45329",
  "tx_id": "TX-9183-AST",
  "event_type": "guardrail_veto",
  "node_id": "ND-11",
  "timestamp": 1720250601,
  "severity": "warning",
  "invariant": "I6",
  "details": "candidate attempted external I/O; vetoed before state mutation",
  "snapshot_ref": "SS-191-0",
  "hash_chain_prev": "0xa1b2c3…",
  "hash_current": "0xd4e5f6…",
  "signature": "0x…"
}
```

---

## Event types

| Type | Description | Invariant |
|---|---|---|
| `validation_error` | A validation failure flagged for escalation. | I5 |
| `rollback` | A deterministic reversion after an aborted candidate. | I8 |
| `guardrail_veto` | The Eye halted a step that would violate an invariant. | I7 |
| `invariant_defense` | A defended attempt to breach I1–I6 (e.g. external source, mint without verdict). | I1, I6 |
| `system_fault` | Internal module error, desync, snapshot fault. | I5 |

There is no `policy_breach` / "emission quota" event. *Because* I1 gates emission on the PoT verdict and I6 leaves no object for a supply cap, "exceeding an emission quota" is not a representable event; the relevant event is `invariant_defense` — an attempt to emit without a verdict (I1) or to admit external value (I6).

---

## Severity levels

| Level | Example |
|---|---|
| `info` | Normal recorded observation (e.g. dry-run path taken). |
| `warning` | Non-fatal anomaly caught and halted by a guardrail. |
| `critical` | Integrity event: invalid snapshot, signature mismatch, attempted invariant breach. |

---

## Storage & protection

- Audit logs are stored in **append-only**, hash-chained segments; each node maintains its own signed chain.
- Periodic Merkle roots may be exported to a notarization anchor point (read-only export of a hash root — never a value bridge, I6).
- Logs cannot be edited, redacted, or overwritten; any such attempt is itself a `critical` `invariant_defense` event.

---

## Cross-node synchronization

Audit chains from multiple nodes are compared by time-window correlation, snapshot-ref matching, and hash-chain cross-validation, to detect forks or divergence. *Because* state and events are reconstructible from recorded causes (I5), divergence is detectable by recomputation rather than by trust.

---

## Integration points

| Module | Role |
|---|---|
| `tx_failure_modes` | Supplies structured failure metadata. |
| `tx_rollback_strategy` | Records rollback triggers and outcomes. |
| `tx_execution_guardrails` | Records guardrail vetoes (I7). |
| `tx_journal_writer` | Cross-references the per-candidate journal entry. |
| `tx_state_snapshot_hook` | Supplies snapshot references. |

---

## Developer notes

- Every emitter signs the record before appending it; `log_id` is globally unique and never reused.
- Recording is non-blocking on the fast path, but a security-relevant effect is **never acknowledged before its audit cause is durable** (I8).
- A continuous `audit_validator` may scan the chain for anomalies — for example, any entry that purports to author a mint, burn, or payment (an I7 violation), which the validator flags `critical`.

---

## Version history

| Version | Date | Changes |
|---|---|---|
| 2.0 | 2026-01-14 | Canon rewrite: events derived from invariants; `guardrail_veto` and `invariant_defense` replace policy/quota events; external anchoring clarified as read-only hash export. |
