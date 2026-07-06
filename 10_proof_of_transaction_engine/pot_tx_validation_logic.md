# PoT Transaction Validation Logic

**Stands on:** I1 (PoT-gated origin), I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality). See `README.md` §2.

## 1. Purpose

Define the **admissibility test**: the deterministic check that decides whether a process may carry a verdict of `verified === 1` at all. This test is the guard on I1. *Because* a positive verdict is the sole cause of a mint (I1) and of payment (I3), the validation logic is not a quality filter applied after the fact — it is the precondition of the one event that creates value. A process that fails this test yields no verdict, and therefore no mint and no payment, by absence of cause.

Validation answers one question: **is this process a genuine, non-contradictory unit of work that the confirmed record permits us to confirm?** It never answers "how much is it worth to hold" — ARO has no market price (I6), so no such question exists here.

## 2. Principles (each derived)

- **Admissibility, not preference (I1).** The test either establishes that a verdict *may* be `1`, or it does not. It has no discretionary middle: an inadmissible process cannot be "confirmed anyway," because that would create a unit with no cause.
- **Determinism (I5).** The test is a pure function of inputs already recorded in NodeChain. Two nodes replaying the same recorded process reach the same admissibility result — the outcome is a property of the record, not of the evaluator.
- **Append-before-acknowledge (I8).** Every input the test reads (process fields, prior process references, participating node identity) is already on-chain before the test runs; the test never depends on an unrecorded fact.

## 3. Validation steps

Each step is a necessary condition for admissibility. Any failure sets the admissibility result to *inadmissible* and the process never reaches a verdict.

1. **Structural check.** The process record is well-formed: valid fields, monotone nonce, timestamp within the recorded drift bound. A malformed record cannot be reproduced deterministically (I5), so it is inadmissible.
2. **Signature check.** The originator's signature verifies against the recorded public key. Without it, the process has no attributable cause on-chain (I8).
3. **Contextual integrity.** The process references only recorded prior state and does not double-consume any value already consumed in NodeChain. A double-consume would let two verdicts claim one cause, contradicting I1.
4. **Node standing check.** The nodes proposing to participate hold current PoT standing (confirmed-work weight, per `pot_tx_weighting_model.md`) and current role eligibility (per `pot_node_role_assignment.md`). Standing derives from confirmed work only, never from a held stake (I6) — there is none to check.
5. **Admissibility result.** If every prior step holds, the process is **admissible**: it may proceed to weighting, role assignment, and quorum attestation, at the end of which a verdict may be `1`. If any step fails, the result is **inadmissible** and the process is recorded as such (I8); no verdict is produced.

## 4. The admissibility function

Admissibility is a conjunction — every condition must hold — not a weighted average that a strong score could rescue:

```
admissible(P) =  structural_ok(P)
             AND signature_ok(P)
             AND context_ok(P)          (no double-consume vs recorded state)
             AND standing_ok(P)         (participants hold confirmed-work standing)
```

*Because* the result gates the sole cause of emission (I1), it is a boolean, not a tunable percentage. Where a bounded quality coefficient is used internally (e.g. a minimum-integrity threshold set by the role-based committee within protocol bounds), it may only make the test **stricter**, never admit a process that fails a necessary condition — a looser bound cannot manufacture a cause that I1 forbids.

## 5. Reference behaviour

```python
def is_admissible(process: dict) -> bool:
    # (1) structural — deterministic prerequisites (I5)
    if not structural_ok(process):
        return False
    # (2) signature — attributable cause on-chain (I8)
    if not signature_ok(process):
        return False
    # (3) contextual integrity — no double-consume of recorded value (I1)
    if double_consume(process["prev_ref"]):
        return False
    # (4) node standing — confirmed-work weight, not stake (I3, I6)
    if not participants_have_standing(process["participants"]):
        return False
    # every necessary condition holds → the process MAY carry a verdict of 1
    return True
```

The function returns whether a verdict *may* be `1`; it does not itself set the verdict. The verdict is set only after weighting, role assignment, and a recorded quorum of attestations (`pot_tx_signature_model.md`).

## 6. Oversight (I7)

The All-Seeing Eye observes every admissibility evaluation and **vetoes** any attempt to advance an inadmissible process toward a verdict. The veto is a halt, never a substitution: the Eye does not "fix" a process and confirm it. It authors no admissibility result of its own (I7).

## 7. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_MALFORMED` | structural check failed | I5 |
| `E_BAD_SIGNATURE` | originator signature does not verify | I8 |
| `E_DOUBLE_CONSUME` | process references already-consumed value | I1 |
| `E_NO_STANDING` | a participant lacks confirmed-work standing | I3, I6 |
| `E_CONFIRM_INADMISSIBLE` | a verdict `1` attempted for an inadmissible process | I1 |

## 8. Dependencies

- `07_processing_layer/` — supplies the process record and its format.
- `02_nodechain_engine/` — supplies signatures, keys, and the recorded prior state (I8).
- `pot_tx_weighting_model.md`, `pot_node_role_assignment.md` — supply node standing and eligibility.

## 9. Notes

- A zero-value administrative process is admissible only if it satisfies every condition above; being zero-value does not exempt it from cause. It mints and pays nothing because there is no amount, not because it is privileged.
- The admissibility result and its inputs are appended to NodeChain (I8) so the verdict — or its absence — is reproducible (I5).
