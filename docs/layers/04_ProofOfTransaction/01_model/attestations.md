# Confirmer attestations (Ed25519)

Confirmers sign a **domain-separated digest** over process identity + journal tip + stages + admission flags. Amounts are **not** in the digest (no amount math in PoT).

## Digest material (`AST-POT-ATTEST-v1`)

| Field | Source |
|-------|--------|
| processId | Processing |
| processType | Processing |
| tipHash / tipHeight | NodeChain tip at verify |
| stagesCompleted | Process + journal (sorted) |
| institutionAllowlisted | process_open payload |
| hasDocuments | process_open payload |
| hasQualifiedSignature | process_open payload |

Digest = SHA-256 of canonical JSON of the above.

## Signature

- Algorithm: **Ed25519 only**
- `KeyRegistry.sign(validatorId, digest)` / `verify`
- Pipeline and Orchestrator **must** pass `keys: KeyRegistry` into `pot.verify`

## Verification rules

1. Attestation validator must be in **eligible** set (active registry ∩ proposed)
2. Bad signature → skip confirmer + reason code
3. Duplicate validatorId → ignored with reason
4. Zero valid attestations → cannot reach `verified=1` when `requireAttestations=true`

## Code

`src/pot/attestation.ts` — `attestationDigest`, `signAttestation`, `verifyAttestations`
