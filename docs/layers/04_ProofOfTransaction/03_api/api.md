# API — PoT service

## Types

See `src/pot/types.ts`.

## Methods

### `evaluateCriteria(evidence) → { criteriaResult, reasonCodes, pass }`

Pure. No I/O.

### `quorumOk(confirmers, validatorIds, ratio?) → { ok, K, Q, confirmerCount, reasonCodes }`

Pure.

### `buildEvidence(process, opts) → PotEvidencePackage`

Reads NodeChain history + tip.

### `verify(process, confirmers, validatorIds?, opts?) → PotVerdict`

Full path: uniqueness → evidence → criteria → timeout → quorum → journal.

### `getFinalVerdict(processId) → PotVerdict | null`

Reads journal for final positive or latest verdict.

## Errors

Thrown as `PotError` with `code` from reason-codes set.
