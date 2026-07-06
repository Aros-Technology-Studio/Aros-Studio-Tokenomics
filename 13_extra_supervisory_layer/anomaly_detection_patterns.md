# Anomaly Detection Patterns

**Stands on:** I7 (observe and VETO, never initiate), I8 (append-only causality), and enforces I1–I6. See `README.md` §1.

## 1. Purpose

This document defines the Eye's **recognition function**: the catalogue of recorded-cause patterns that mean "this step would violate an invariant." Recognizing one of these patterns *in the pre-acknowledgement window* (I8) is precisely the trigger for a **veto** (I7). Recognizing a drift *after* an effect was already acknowledged is the trigger for an **integrity signal** (see `integrity_signal_emission.md`).

A pattern here is not a heuristic guess. Each is the exact negation of an invariant, so matching it is not "suspicion" — it is proof that acknowledging the step would break the causal closure.

---

## 2. What an anomaly is, precisely

An anomaly is a **recorded cause whose acknowledged effect would contradict I1–I6.** Because the invariants are closed (every lawful state satisfies them), any candidate step is either lawful or matches exactly one or more of the negation patterns below. There is no third category. This is why the Eye can act on certainty rather than probability.

Two dispositions follow from *when* the pattern is seen:

- **Seen in the I8 window (cause recorded, effect not yet acknowledged):** the Eye asserts a **VETO** — the effect is never acknowledged (I7).
- **Seen after acknowledgement (a drift the window did not catch, or a reconstruction from history):** the Eye emits an **integrity signal** and the step is a candidate for the circuit breaker (see `README.md` §6 of `01_coin_engine`). The Eye still authors nothing — it stops or signals.

---

## 3. Pattern catalogue — organized by the invariant defended

Each pattern is the machine-checkable negation of an invariant. `processId` (`P`) and amount (`A`) refer to the confirmed process under evaluation.

### A. Origin patterns — defend I1 (PoT-gated origin)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| ORG-001 | Mint of a process part with **no** recorded PoT verdict for `P` | VETO (I1) |
| ORG-002 | Verdict for `P` exists but `verified ≠ 1` | VETO (I1) |
| ORG-003 | Mint amount ≠ the process amount `A` bound to `P` | VETO (I1, I2) |
| ORG-004 | Emission cause other than a PoT verdict (schedule, pre-mine, mint-on-deposit) | VETO (I1) |

### B. Conservation patterns — defend I2 (born-and-burned)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| CON-101 | Cycle close for `P` with `processMinted ≠ processBurned` | VETO (I2) |
| CON-102 | Burn amount for `P` ≠ the amount minted for `P` | VETO (I2) |
| CON-103 | Process part still live after its cycle completed | VETO / signal (I2) |

### C. Payment patterns — defend I3 (payment for confirmed work)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| PAY-201 | Node payment credited with no preceding `verified === 1` verdict for the same work | VETO (I3) |
| PAY-202 | Payment appended **before** its confirmation (out of I8 order) | VETO (I3, I8) |
| PAY-203 | The earned/retained part burned or clawed back | VETO (I3) |

### D. Reserve patterns — defend I4 (reserve is AST's own)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| RES-301 | Reserve share routed anywhere other than `SYSTEM_RESERVE` | VETO (I4) |
| RES-302 | `reserveIndex` moved by an input other than confirmed `totalProcessVolume` | VETO (I4) |
| RES-303 | `reserveIndex` decreasing while volume is non-decreasing (breaks I‑RS‑4 monotonicity) | VETO (I4) |

### E. Determinism patterns — defend I5 (determinism)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| DET-401 | A recorded cause applied a second time, producing a second effect (replay) | VETO (I5, I8) |
| DET-402 | An effect not reproducible from its recorded canonical inputs | VETO (I5) |
| DET-403 | A movement whose cause is absent from NodeChain (discretionary origin) | VETO (I5, I8) |

### F. Speculative-surface patterns — defend I6 (no speculative surface)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| SPC-501 | A step that would impose a supply cap, price floor, or volatility control | VETO (I6) |
| SPC-502 | A step conditioning participation or earning on a held balance (staking-for-yield / deposit-to-participate) | VETO (I6) |
| SPC-503 | Ingestion of external-crypto or fiat value, or a mint-on-deposit | VETO (I6) |
| SPC-504 | A governance effect weighted by ARO holdings | VETO (I6) |

### G. Causality patterns — defend I8 (append-only causality)

| Pattern ID | Recorded-cause condition | Disposition |
| --- | --- | --- |
| CAU-601 | An effect acknowledged **before** its cause was appended | VETO (I8) |
| CAU-602 | A mutation or reordering of an already-appended cause | VETO (I5, I8) |

*Because* each row is the exact negation of a stated invariant, matching a row is equivalent to proving the step unlawful — the Eye never vetoes on a hunch.

---

## 4. Recording a match

Every match the Eye recognizes is itself a cause, appended to NodeChain before any disposition takes effect (I8). The record names the pattern and the step it defends against:

```json
{
  "type": "anomaly_match",
  "pattern_id": "PAY-201",
  "processId": "P-88231",
  "invariant": "I3",
  "disposition": "veto",
  "cause_ref": "0xa7f23b...",
  "detected_at": 1731942032
}
```

The `cause_ref` points to the recorded cause that matched; the `disposition` is `veto` (pre-acknowledgement) or `signal` (post-acknowledgement drift). This record is append-only and reproducible (I5, I8) — see `meta_event_logging_protocol.md`.

---

## 5. Why there are no "false positives" to tune away

The obsolete design spoke of cooldowns, soft-ignores, and benign-pattern suppression. Those have **no object** here: because every pattern in §3 is the exact negation of an invariant, a match is a proof, not a probabilistic flag. A step either violates an invariant or it does not.

- There is nothing to "soft-ignore," because a true match is by construction an unlawful step (I1–I6).
- There is no threshold to relax, because the invariants are exact equalities and gates, not statistical bands.
- The Eye therefore vetoes on certainty. Its restraint is guaranteed instead by I7: even on a match, all it can do is *stop* — it can never over-react by authoring a correction.

---

## 6. Extending the catalogue

New patterns may be added only as **further exact negations of the existing invariants** — never as new economic rules.

- An addition is a role-based AI committee decision (see `README.md` §5), appended before effect (I8) and reproducible (I5).
- An addition may narrow what is lawful (recognize a new way to violate an invariant); it may never widen it, because the invariants themselves are not committee-changeable.
- No addition can grant the Eye a primitive beyond veto and signal (I7).

---

## 7. Summary

The detection catalogue is the invariant spine restated as machine-checkable negations. Matching a pattern in the I8 window is the trigger for a veto (I7); matching it after the fact is the trigger for a signal. In both cases the Eye stops or informs — and authors nothing.
</content>
