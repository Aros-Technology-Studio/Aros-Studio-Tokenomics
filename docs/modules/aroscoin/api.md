# ArosCoin — API

**Code:** `src/aroscoin` (`AroscoinService`)  
**Canon:** §VI  
**Ack rule:** NodeChain success → then client ack.

---

## Conceptual operations

### mint

**Inputs (conceptual)**

| Input | Source |
|-------|--------|
| amount DTO (floored arx) | emission |
| processId, claimId | process pipeline |
| PoT verification proof / height | pot + nodechain |
| institutional rate/valuation ref | institutional input |
| reserve lock proof | reserve (when required) |

**Outputs:** receipt after NodeChain; `AroMinted` event.

**Rejects:** missing PoT, admin path, double mint, kill switch, invariant break.

### burn

**Inputs:** processId, claimId, amount, process proof, plan type (revaluation decrease / reassignment / release path).

**Outputs:** receipt after NodeChain; `AroBurned`.

### transfer (internal)

**Inputs:** from/to claims, amount, processId when rights-significant, PoT as required.

**Pre-Release:** reject external free-market transfer paths.

### reassign (normative pattern)

Not a silent balance rewrite: **burn + remint** under processes. API may expose a coordinated operation but must still record both economic legs with NodeChain.

---

## Events

| Event | Meaning |
|-------|---------|
| `AroMinted` | After NodeChain append |
| `AroBurned` | After NodeChain append |
| `AroTransferred` | Permissioned internal |
| `AroDoubleMintRejected` | Guard on TS and/or adapter |

---

## Error codes

| Code | When |
|------|------|
| `POT_NOT_VERIFIED` | Mint/burn without verified process |
| `ADMIN_MINT_FORBIDDEN` | Privileged mint attempt |
| `INSUFFICIENT_RESERVE` | Missing/insufficient lock |
| `INVARIANT_BROKEN` | Write-path assert failed |
| `NODECHAIN_APPEND_FAILED` | Cannot record; no ack |
| `INVALID_AMOUNT` / `INVALID_DECIMAL` | Money parse/floor failure |
| `KILL_SWITCH_ACTIVE` | Read-only mode |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `pot` | verified process |
| `emission` | amounts / valuation-driven deltas |
| `reserve` | lock / bag |
| `nodechain` | record before ack |
| `invariants` | write-path asserts |
| `common` | money, errors, ids |

| Depended on by | Why |
|----------------|-----|
| `orchestrator` | lifecycle |
| `commission` | ARO payment units |
| `release` / partial-release | circulation & atomic burn paths |
| adapters | external representation |

---

## Explicit non-APIs

| Forbidden | Reason |
|-----------|--------|
| `adminMint` | Forbidden forever |
| `setTotalSupply` | Supply only via process mint/burn |
| `importFromErc` as SoT | ERC not SoT |
| Eye-driven mint/burn | Observation only |

---

## Query surfaces

Balance and claim queries return **canonical** state from AST ledgers / NodeChain-derived views. Adapter queries are labeled representation-only when exposed.
