# Meta-Event Logging Protocol

**Stands on:** I8 (append-only causality), I5 (determinism), I7 (observe and VETO, never initiate). See `README.md` §1.

## 1. Purpose

This document defines how the Eye records what it observes, what it vetoes, and what it signals. The record is not a side-channel: it is appended to **NodeChain**, the same append-only causal ledger every economic cause is written to (I8). *Because* the Eye's veto is itself a cause whose effect is "an effect withheld," it must be recorded before that effect is realized — exactly like any other cause (I8).

---

## 2. Logging model

Every observation, veto, and signal is a **meta-event object**, appended to NodeChain before its disposition takes effect (I8) and signed so its origin is non-repudiable.

```json
{
  "event_id": "EVT-548292",
  "seq": 918342,
  "timestamp": 1731942217,
  "type": "veto",
  "invariant": "I3",
  "pattern_id": "PAY-201",
  "cause_ref": "0xa7f23b...",
  "processId": "P-88231",
  "disposition": "effect_withheld",
  "signature": "0xfeedbeef..."
}
```

- `cause_ref` links to the recorded economic cause this meta-event is about (I8) — the Eye always writes *about* an already-recorded cause, never inventing one.
- `seq` is the NodeChain append position; it fixes causal order so the record is reproducible (I5).
- `disposition` is `effect_withheld` (a veto), `acknowledged` (an observation of a lawful step), or `signal_emitted` (a post-acknowledgement drift).

---

## 3. Storage — NodeChain, not an external anchor

The Eye's log **is part of NodeChain**, because NodeChain is already the canonical append-only, Merkle-linked causal ledger (I8). This is not a design preference; it is forced by two invariants:

- **I8** requires every cause — including a veto — to be appended before its effect. A veto recorded anywhere but the causal ledger could not be ordered against the step it withholds.
- **I5** requires the whole history to be reproducible from canonical inputs. A log kept off the canonical ledger would be a second, unreproducible source of truth — which I5 forbids.

*Therefore* there is **no object** here for an external, mirrored, or bridged log store: no IPFS/Arweave/Filecoin anchor, no separate "oversight ledger," no external-chain digest. Those would be a second ledger outside I5's reproducibility and I8's ordering. The Eye writes to NodeChain and nowhere else.

---

## 4. Meta-event types

| Type | Meaning | Disposition |
| --- | --- | --- |
| `observation` | A lawful step read and confirmed to satisfy I1–I6 | `acknowledged` |
| `veto` | A step that would violate I1–I6, halted in the I8 window (I7) | `effect_withheld` |
| `integrity_signal` | A post-acknowledgement drift, surfaced for oversight | `signal_emitted` |
| `scope_note` | A read whose object was absent (see `observation_scope_and_limits.md` §3) | `acknowledged` |
| `observer_join` | A read-only observer node registered (see `observer_node_interface.md`) | `acknowledged` |
| `observer_exit` | An observer node deregistered | `acknowledged` |

Every type is *about* a recorded cause or an observer lifecycle event. None of them authors an economic cause — there is no `mint`, `burn`, or `pay` meta-event, because I7 gives the Eye no such primitive.

---

## 5. Signing and non-repudiation

- Each meta-event is signed with the Eye's supervisory key, so its origin is provable.
- Read-only observer nodes may co-verify a meta-event's signature (see `observer_node_interface.md`); co-verification is a check, not a co-authorship — an observer cannot alter or veto anything (I7).
- On retrieval, the signature and the `seq`/`cause_ref` links are checked, so any tampering breaks reproducibility (I5) and is itself detectable.

---

## 6. Ordering and completeness, not rate caps

The obsolete design imposed per-block rate caps and dropped overflow entries. That has **no object** here: dropping a meta-event would violate I8 (a cause not appended) and I5 (a history that no longer reproduces). *Therefore* the Eye never drops a record.

What governs the log instead is **causal ordering**:

- Every meta-event is appended in `seq` order before its disposition takes effect (I8).
- A veto's meta-event is appended before the guarded effect is withheld, so the record can never lag the decision.
- Volume is bounded by the economic activity it mirrors — the Eye writes one meta-event per step it judges, no more and no fewer — so there is nothing to "cap."

---

## 7. What the log never contains

Because the Eye reads only recorded causes (see `observation_scope_and_limits.md`), the log inherits those limits:

- No user identifiers, balances-as-identity, or address histories — a held balance confers no power (I6), so it is not a cause worth recording.
- No keys, secrets, or transient execution state — none is a cause of a lawful step (I5).
- No market or price data — ARO has no market price (I6), so there is no such datum.

Only recorded causes and the Eye's own dispositions over them are ever written.

---

## 8. Query protocol

Read-only observer nodes retrieve meta-events by signed request against NodeChain's supervisory records:

```
GET /eye/log?type=veto&from_seq=918000
GET /eye/log?event_id=EVT-548292
GET /eye/log?processId=P-88231
```

Retrieval is read-only and reproducible: the same query against the same NodeChain state returns the same records, in the same order (I5, I8). Access is limited to nodes registered per `observer_node_interface.md`.

---

## 9. Summary

Logging is the Eye's record of its sight and its vetoes — appended to NodeChain before effect (I8), reproducible (I5), and free of any economic primitive (I7). The log can *witness and stop*; it can never author. Every observation, every veto, every drift is preserved in causal order, and none is ever dropped.
</content>
