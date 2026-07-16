# MODEL — `oracle-gateway`

**Status:** ready  
**Canon refs:** P2 orchestrator; P4.16

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| OracleAttestation | Signed payload from one oracle | `oracleId` + signature |
| OracleGatewayResult | Aggregated accept/reject | `processId` + counts |
| AcceptedSet | Distinct verified oracles | set of `oracleId` |

---

## States and lifecycle

```
orchestrator requires oracle step
  → submit(processId, attestations[])
  → verify each signature; dedupe oracleId
  → if acceptedCount ≥ requiredCount:
        append NodeChain oracle_gateway_accepted
        return ok=true
  → else:
        return ok=false, reasonCode=ORACLE_QUORUM_FAILED
        orchestrator fail-closed → process expired
```

No pending soft state in gateway itself: one-shot submit result. Retry requires process rules / new evidence under orchestrator policy (not silent bypass).

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| local | signature verified or attestation dropped | never count invalid |
| local | distinct oracleIds only | no double count |
| local | accept ⇒ NodeChain record | fail closed if append fails |
| local | not ok ⇒ no emission path open | orchestrator must not continue |

---

## Formulas / constants

```
acceptedCount = |{ distinct oracleId : signature_valid(attestation) }|
ok ⇔ acceptedCount ≥ requiredCount
```

Default `requiredCount = 2` when step is used (configurable).  
Stub/test signatures may use deterministic hash digest for unit tests only; prod uses real crypto verify.

---

## Anti-scope

- Not a price oracle that sets institutional valuation.  
- Not PoT.  
- Not admin override to force ok.  
