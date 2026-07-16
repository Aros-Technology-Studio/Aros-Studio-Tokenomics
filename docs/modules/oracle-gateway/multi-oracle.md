# Oracle Gateway — multi-oracle quorum

**Module:** `oracle-gateway`  
**Code:** `src/oracle-gateway/oracle-gateway.service.ts`  
**Types:** `src/oracle-gateway/oracle-gateway.types.ts`

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| OracleAttestation | Signed payload from one oracle | `oracleId` + signature |
| OracleGatewayResult | Aggregated accept/reject | `processId` + counts |
| AcceptedSet | Distinct verified oracles | set of `oracleId` |

---

## Algorithm

```text
submit(processId, attestations[]):
  accepted = []
  seen = ∅
  for each attestation a:
    if a.oracleId ∈ seen: continue
    if not verify(a): continue
    seen.add(a.oracleId)
    accepted.push(a)

  if |accepted| < requiredCount:
    return { ok:false, acceptedCount, requiredCount, reasonCode: ORACLE_QUORUM_FAILED }

  nodechain.append(oracle_gateway_accepted, { oracleIds, count })
  return { ok:true, acceptedCount, requiredCount }
```

### Formula

```text
acceptedCount = |{ distinct oracleId : signature_valid(attestation) }|
ok ⇔ acceptedCount ≥ requiredCount
```

---

## Configuration

| Key | Rule |
|-----|------|
| `requiredCount` | Configurable; default **2** when step used; `setRequiredCount(n)` enforces `n ≥ 1` |
| Always-1 with no config | Non-conformant as sole production posture |

---

## Signature verification rules

| Case | Result |
|------|--------|
| Valid PEM verify | Count |
| Valid test stub digest (non-prod) | Count (tests only) |
| Invalid / throw on verify | Skip (not counted) |
| Missing fields | Skip |

Never count invalid signatures toward quorum.

---

## Lifecycle

```text
orchestrator requires oracle step
  → submit(processId, attestations[])
  → verify each; dedupe oracleId
  → if ok: NodeChain record + continue pipeline toward PoT
  → else: ok=false → orchestrator fail-closed → process expired
```

No soft pending state inside gateway: **one-shot submit result**. Retry requires process rules / new evidence under Orchestrator policy — not silent bypass.

---

## Events

| Event | Meaning |
|-------|---------|
| `OracleGatewayAccepted` | Quorum met; ledger recorded |
| `OracleGatewayFailed` | Fail-closed signal |

Eye observes both; Eye does not override.

---

## Invariants

| Rule | Effect if violated |
|------|--------------------|
| Signature verified or dropped | Never count invalid |
| Distinct oracleIds only | No double count |
| Accept ⇒ NodeChain record | Fail closed if append fails |
| not ok ⇒ no emission path open | Orchestrator must not continue |

---

## Anti-scope

- Not a price oracle that **sets** institutional valuation for AST  
- Not PoT  
- Not admin override to force ok  
- Not partial economic mutation  
