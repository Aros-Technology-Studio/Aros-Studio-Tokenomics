# CONTRACT — `oracle-gateway`

**Status:** ready  
**Canon refs:** P2 pipeline; P4.16  
**Code path:** `src/oracle-gateway/`

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| processId | orchestrator | yes | ties accept record |
| attestations[] | external oracles | yes | each: oracleId, payload, signature, publicKey |
| requiredCount | config | yes | default 2 |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| OracleGatewayResult.ok | orchestrator | gate |
| acceptedCount / requiredCount | orchestrator / audit | metrics |
| reasonCode | orchestrator / Eye | e.g. ORACLE_QUORUM_FAILED |
| nodechain record | nodechain | on ok only |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `OracleGatewayAccepted` | out | quorum met; ledger recorded |
| `OracleGatewayFailed` | out | fail-closed signal |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodechain` | append acceptance |
| crypto verify | signature check |

| Depended on by | Why |
|----------------|-----|
| `orchestrator` | optional step before PoT |

---

## API shape (implementation)

| Method | Behavior |
|--------|----------|
| `setRequiredCount(n)` | n ≥ 1 |
| `submit(processId, attestations)` | verify + quorum + optional append |
| `requireOk(processId, attestations)` | throw fail-closed if not ok |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| acceptedCount < requiredCount | ok=false; reason ORACLE_QUORUM_FAILED |
| invalid signature | attestation ignored (not counted) |
| duplicate oracleId | counted once |
| NodeChain append failure after quorum | fail closed (do not report soft ok) |
| process requires oracle, step skipped | **forbidden** in v1 |

---

## Explicit non-goals

- AST-authored institutional valuation  
- Mint / burn / reserve mutation  
- Replacing PoT criteria P1–P4  
