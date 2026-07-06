# PoT Node Role Assignment

**Stands on:** I3 (payment for confirmed work), I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality). See `README.md` §2.

## 1. Purpose

Define how nodes are assigned the roles by which they **participate in reaching a verdict** — proposer, attester, observer. A verdict of `verified === 1` is reached by a quorum of attesting nodes (`pot_tx_signature_model.md`); role assignment decides which nodes may attest for a given process, and in what capacity. *Because* the verdict is the sole cause of emission (I1) and payment (I3), who is allowed to help produce it must itself be determined without discretion and without possession: eligibility derives from **confirmed-work standing** (PoT weight), never from a held stake or balance (I6).

## 2. Principles (each derived)

- **Eligibility from confirmed work (I3, I6).** A node's priority for participation is its PoT weight — a measure of confirmed work (`pot_tx_weighting_model.md`). *Because* I6 leaves no held stake, no node buys a role and no role is a purchased seat; standing is earned by confirmed contribution and lapses by its absence.
- **Deterministic selection (I5).** Assignment is a pure function of the recorded weights and a recorded epoch seed. Any node replaying the record derives the same assignment — the roster is a property of the record, not of who computed it.
- **Recorded before effect (I8).** The weights, the seed, and the resulting roster are appended to NodeChain before any assigned node attests.

## 3. Assignment logic

1. **Order by standing.** Sort active nodes by PoT weight, descending (confirmed-work standing — I3).
2. **Seed from the record.** Draw a deterministic seed from the recorded NodeChain epoch (a hash of recorded epoch data) so selection is reproducible (I5) yet not predictable far in advance.
3. **Assign roles.** From the ordered, seeded set, assign a bounded top fraction as **proposers/attesters** (the nodes whose quorum can produce a verdict) and the remainder as **observers**. The fractions are bounded parameters set by the role-based committee (I8), within limits that always preserve a genuine multi-node quorum — never a single dominant node, which would let one party reach a verdict alone and break the quorum requirement behind I1.
4. **Rotate every epoch.** Reassign each epoch so that standing must be continuously re-earned by confirmed work, preventing any fixed group from capturing the verdict path.

## 4. Reference behaviour

```python
import hashlib

def assign_roles(nodes: list[dict], epoch_data: bytes, attester_fraction: float) -> dict:
    # (1) order by confirmed-work standing (I3)
    ordered = sorted(nodes, key=lambda n: n["pot_weight"], reverse=True)

    # (2) deterministic, record-derived seed (I5)
    seed = int(hashlib.sha256(epoch_data).hexdigest(), 16)

    # (3) bounded attester set; the rest observe
    num_attesters = max(1, int(len(ordered) * attester_fraction))
    roles = {}
    for i, node in enumerate(ordered):
        rank = (i + seed) % len(ordered)        # record-seeded rotation, reproducible
        roles[node["id"]] = "attester" if i < num_attesters else "observer"
        node["_rank"] = rank
    return roles
```

Selection reads `pot_weight` — confirmed-work standing — and a recorded seed; it reads no stake, deposit, or balance, because none exists (I6). The result is deterministic given the record (I5).

## 5. Oversight and rotation

- **Rotation (I3).** Roles are re-derived every epoch. A node keeps a participatory role only by continuing to produce confirmed work; standing that is not renewed lapses. This is the canonical replacement for any "locked seat" — seats are earned each epoch, never held.
- **Eye veto (I7).** The All-Seeing Eye observes each assignment and **vetoes** any roster that would violate the quorum requirement (e.g. concentrate attestation power enough to let one party reach a verdict). It authors no roster of its own.
- **Removal, not slashing.** A node found by evidence to have attested falsely is removed from eligible roles by role governance (see `pot_slashing_conditions.md`); it is not "slashed," because there is no held stake to slash (I6). Removal withdraws future participation; it seizes nothing.

## 6. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_ROLE_FROM_POSSESSION` | eligibility computed from stake/holdings | I3, I6 |
| `E_ROSTER_NOT_REPRODUCIBLE` | replay of weights + seed yields a different roster | I5 |
| `E_QUORUM_CAPTURE` | roster concentrates attestation power below a genuine quorum | I1 |
| `E_UNRECORDED_ROSTER` | a node attested before the roster was appended | I8 |

## 7. Dependencies

- `pot_tx_weighting_model.md` — supplies the `pot_weight` standing that orders assignment.
- `pot_tx_signature_model.md` — consumes the assigned attester set to gather the quorum.
- `pot_slashing_conditions.md` — the canonical position on removing a node that attests falsely.
- `02_nodechain_engine/` — supplies the node registry and the recorded epoch seed (I8).

## 8. Notes

- Every rotation is recorded before it takes effect (I8) and is reproducible (I5); the roster in force for any process is auditable.
- Reassignment on removal is triggered by evidence via role governance, not by seizing a stake — there is none.
