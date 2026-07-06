# PoT Transaction Signature Model

**Stands on:** I1 (PoT-gated origin), I5 (determinism), I7 (Eye veto), I8 (append-only causality). See `README.md` §2.

## 1. Purpose

Define how a verdict of `verified === 1` is **attested**: the multi-signature quorum that records *who* confirmed a process, and the condition under which that quorum is sufficient to set the verdict. *Because* a positive verdict is the sole cause of a mint (I1), a verdict must never rest on a single node's word; it must be a recorded quorum of independently signing nodes. The signature model is the append-only proof that the verdict had cause and had witnesses.

## 2. Principles (each derived)

- **A verdict needs a quorum, not an authority (I1).** No single node — and no Eye — can set `verified === 1`. *Because* I1 forbids discretionary issuance, the confirming act must be a quorum of the epoch's assigned attesters, each signing independently.
- **Attestations are recorded before the verdict (I8).** Each signature is appended to NodeChain as it is collected; the verdict is acknowledged only after the recorded set reaches quorum. The cause (the signatures) precedes the effect (the verdict).
- **Deterministic verification (I5).** Whether a signature set meets quorum is a pure function of the recorded signatures and the recorded attester roster. Any node replaying the record reaches the same conclusion.

## 3. Signature flow

1. **Sign.** Each assigned attester (from `pot_node_role_assignment.md`) signs `hash(process ‖ its confirmed-work weight)` with its NodeChain key.
2. **Aggregate and record.** Signatures are collected in the process's NodeChain shard and appended as they arrive (I8).
3. **Test quorum.** When the count of valid, distinct attester signatures reaches the quorum fraction of the assigned roster, the verdict may be set to `1`. Below quorum, no verdict is produced and no mint or payment follows — absence of cause (I1, I3).

## 4. Quorum condition

```
quorum_met = ( count(valid, distinct attester signatures) ≥ ⌈quorum_fraction · roster_size⌉ )

    default quorum_fraction = 0.67        (bounded, role-set; > 0.5 always required)
```

*Because* the verdict is the sole cause of emission (I1), the quorum fraction is bounded so it can never fall to or below a simple half — a sub-majority could let a colluding minority manufacture a verdict. The fraction is a role-based committee parameter (I8, recorded before effect), tunable only within bounds that keep the quorum a genuine majority of independent attesters.

## 5. Reference behaviour

```solidity
function quorumMet(
    bytes32 processHash,
    bytes[] memory signatures,
    address[] memory roster,     // assigned attesters for this process (I8-recorded)
    uint256 quorumBps            // bounded, role-set, > 5000
) public pure returns (bool) {
    uint256 need = (roster.length * quorumBps + 9999) / 10000;   // ceil
    uint256 valid = 0;
    for (uint256 i = 0; i < signatures.length; i++) {
        if (isRosterMember(recoverSigner(processHash, signatures[i]), roster)) {
            valid++;
        }
    }
    return valid >= need;   // verdict may be 1 only when this holds (I1)
}
```

The function decides only whether the recorded signatures suffice; setting the verdict, and the mint/payment it causes, follow from a `true` result plus an admissible process (`pot_tx_validation_logic.md`).

## 6. Oversight (I7)

The All-Seeing Eye observes each attestation set and **vetoes** any verdict that would be set without a recorded quorum, or on signatures from nodes not on the assigned roster. The veto halts the verdict; the Eye never contributes a signature and never sets a verdict itself (I7).

## 7. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_NO_QUORUM` | verdict `1` attempted below quorum | I1 |
| `E_NON_ROSTER_SIGNER` | a counted signature is from a node not on the assigned roster | I1, I8 |
| `E_DUPLICATE_SIGNATURE` | the same attester counted twice toward quorum | I5 |
| `E_QUORUM_TOO_LOW` | `quorum_fraction ≤ 0.5` | I1 |
| `E_VERDICT_BEFORE_RECORD` | verdict acknowledged before signatures appended | I8 |

## 8. Node non-response and timeout

An assigned attester that does not sign within the epoch's window simply does not contribute to quorum; if too few sign, the process reaches no verdict and is retried under a fresh roster next epoch. A non-signing node loses future eligibility through role governance (`pot_node_role_assignment.md`) — its standing is not renewed — but **nothing is seized**, because there is no held stake (I6). Non-response costs a node participation, not a balance.

## 9. Dependencies

- `pot_node_role_assignment.md` — supplies the assigned attester roster.
- `02_nodechain_engine/` — supplies node keys and the append-only signature record (I8).
- `pot_challenge_response.md` — the path by which an attested but false verdict is contested before it settles.

## 10. Notes

- Every signature and the quorum result are appended before the verdict (I8), so the verdict is reproducible from the record (I5).
- The quorum requirement is the structural reason a single party — including the Eye — can never mint: value requires a majority of independent witnesses to a real process (I1).
