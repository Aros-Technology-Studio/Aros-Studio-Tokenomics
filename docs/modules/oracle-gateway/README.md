# Oracle Gateway module

**Code path:** `src/oracle-gateway/`  
**Canon:** Core Canon §XII (Oracle Gateway failure → fail-closed); pipeline step 3  
**Decisions:** P4.16 oracle_gateway — multi-oracle + signatures; fail-closed  
**Pack:** `docs/components/oracle-gateway/`

---

## Role

Optional **Orchestrator pipeline step** that admits **external attested inputs** when a process needs transport data beyond the direct institutional package.

| Is | Is not |
|----|--------|
| Multi-oracle intake | AST self-appraisal / price invention |
| Signature verification | PoT replacement |
| Quorum count (`requiredCount`) | Mint / burn / reserve mutation |
| NodeChain record **on accept** | Soft-pass on bad signatures |
| Fail-closed signal to Orchestrator | Admin force-ok |

---

## Pipeline position

```text
… → DocumentValidation → OracleGateway (if required) → PoTEvaluation → …
```

- When process type **requires** oracle: **skip forbidden** in v1.  
- When **not** required: step omitted without inventing data.  
- Failure → Orchestrator **fail-closed → process expired**.  

---

## Defaults

| Parameter | Default |
|-----------|---------|
| `requiredCount` | **2** (configurable; ≥ 1) |
| Distinct `oracleId` | Counted once |
| Invalid signature | Attestation ignored (not counted) |
| Accept | Append `oracle_gateway_accepted` to NodeChain |

---

## Module docs in this folder

| File | Topic |
|------|--------|
| [trust-model.md](./trust-model.md) | What is trusted; transport vs valuation |
| [multi-oracle.md](./multi-oracle.md) | Quorum, dedupe, signatures |
| [api.md](./api.md) | Service API shape |

---

## Related

- Orchestrator: [../orchestrator/pipeline.md](../orchestrator/pipeline.md)  
- Eye: observes accept/fail events  
- Emission: **never** called from gateway  
