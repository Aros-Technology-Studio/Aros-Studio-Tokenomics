# PoT Challenge-Response Mechanism

**Stands on:** I1 (PoT-gated origin), I3 (payment for confirmed work), I5 (determinism), I7 (Eye veto), I8 (append-only causality). See `README.md` §2.

## 1. Purpose

Define how a verdict that *should not* be `verified === 1` is **contested before it settles**. A verdict is the sole cause of a mint (I1) and of payment (I3); therefore a false verdict is the only way an unfounded unit could enter the supply. Challenge-response is the bounded window in which any node may present recorded evidence that a pending verdict lacks cause, so the verdict is corrected to its true value *before* it causes emission — not unwound afterward.

## 2. Principles (each derived)

- **Contest before settlement (I1).** A verdict causes a mint only after its challenge window closes clean. *Because* I1 admits no unit without a true verdict, the safe point to catch a false one is before the cause fires, not after value exists.
- **Evidence, not opinion (I5, I8).** A challenge succeeds only by pointing to recorded facts — a missing signature, a double-consume, an inadmissible process — that any node can replay to the same conclusion. It is not a vote on preference; it is a deterministic re-derivation from the record.
- **Open to any node (I8).** Any NodeChain node — not only the attesters — may challenge, because the record it appeals to is common. The challenge itself is appended before it takes effect.

## 3. Mechanism

1. **Challenge.** Within the challenge window (bounded, one epoch by default), a node appends a challenge citing recorded evidence that the pending verdict lacks cause (e.g. a signature from a non-roster node, a double-consumed reference, an inadmissible process).
2. **Response.** The attesters whose quorum set the verdict append a counter-proof from the record — the signatures, the roster, the admissibility inputs — showing the cause holds.
3. **Resolution.** Because both sides cite recorded facts, resolution is a deterministic re-derivation (I5): if the challenge's evidence holds, the pending verdict is corrected to `verified !== 1` and **no mint and no payment follow** — the cause simply never fires (I1, I3). If the counter-proof holds, the verdict stands and settles. Genuinely ambiguous cases escalate to the role-based governance committee (`06_governance_layer/`), never to a holder vote (I6).

## 4. Reference behaviour

```python
def resolve_challenge(process_id: str, evidence: dict) -> str:
    # deterministic re-derivation from the recorded facts (I5, I8)
    if evidence_holds(process_id, evidence):
        set_verdict(process_id, verified=0)     # cause never fires → no mint, no payment (I1, I3)
        return "verdict_corrected"
    if counter_proof_holds(process_id):
        return "verdict_stands"                 # settles and causes emission
    escalate_to_role_governance(process_id)     # bounded committee, not a holder vote (I6)
    return "escalated"
```

The function never *creates* a payment or a mint; a successful challenge only prevents a cause from firing. Its power over the supply is strictly negative, like the Eye's.

## 5. Consequence for a false attester

A node shown by a successful challenge to have attested falsely produced **no confirmed work** for that process — its attestation was not a genuine confirmation. Therefore, by I3, it is **paid nothing** for it (absence of cause), and by evidence it loses future eligibility through role governance (`pot_slashing_conditions.md`, `pot_node_role_assignment.md`). Nothing is seized: there is no held stake to slash (I6). The consequence is non-payment plus withdrawal of future participation — both the plain result of the confirmed record, not a confiscation.

## 6. Oversight (I7)

The All-Seeing Eye observes every challenge and response and **vetoes** any attempt to settle a verdict whose challenge window is still open or whose challenge succeeded on the record. It renders no verdict of its own and pays no challenger; it only prevents a false verdict from settling (I7).

## 7. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_SETTLE_UNDER_CHALLENGE` | verdict settled while a valid challenge was open | I1 |
| `E_CHALLENGE_NO_EVIDENCE` | challenge with no recorded evidence to re-derive | I5, I8 |
| `E_RESOLUTION_NONDETERMINISTIC` | replay of the evidence yields a different resolution | I5 |
| `E_CHALLENGER_PAID_UNCONFIRMED` | a challenger credited without confirmed work | I3 |

## 8. Dependencies

- `pot_tx_signature_model.md` — the attestation set a challenge tests.
- `pot_tx_validation_logic.md` — the admissibility facts a challenge may cite.
- `06_governance_layer/` — the role-based committee for genuinely ambiguous escalations (not a holder vote — I6).

## 9. Notes

- A challenge and its resolution are appended before any settlement (I8), so the outcome is reproducible (I5).
- The mechanism protects the supply by preventing a false cause, never by clawing back value after the fact — because value that never had a cause is never minted (I1).
