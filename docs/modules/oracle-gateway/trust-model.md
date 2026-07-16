# Oracle Gateway — trust model

**Module:** `oracle-gateway`  
**Canon:** AST does not appraise assets (§5.1); significant actions need NodeChain (§4.1)  
**Pack PURPOSE:** transport only — not AST self-appraisal  

---

## Trust statement

```text
Oracle Gateway trusts: cryptographic validity + multi-oracle quorum of EXTERNAL attestations
Oracle Gateway does NOT create: institutional valuation as AST
Oracle Gateway does NOT replace: PoT (P1–P4) or NodeChain finality of process outcomes
```

AST’s mission is to **record** confirmed institutional valuation and rights — not to invent prices from oracle feeds.

---

## What may be transported

Examples of legitimate attestation payloads (process-type dependent):

- Market reference data required by a process type (not redefining institutional official price without process rules)  
- External confirmations referenced by institutional package  
- Cross-system attested facts the process type demands before PoT  

Exact payload schemas are process-type config. Gateway verifies **who signed** and **quorum**, not “does AST like this price.”

---

## Trust components

| Component | Trust role |
|-----------|------------|
| `oracleId` | Distinct external oracle identity |
| `publicKey` | Verification material for signature |
| `signature` | Binds payload to oracle |
| `payload` | Opaque/structured attested content |
| `requiredCount` | Minimum distinct valid oracles |
| NodeChain accept record | Makes acceptance auditable |

### Production crypto

- Asymmetric verify (e.g. SHA256 + PEM public key) when keys are real  
- Stub/test signatures (`sha256(payload|oracleId)` hex or `stub:…`) **only** for unit tests — not prod trust  

---

## Fail-closed trust

| Condition | Trust decision |
|-----------|----------------|
| `acceptedCount < requiredCount` | **Do not trust** → `ok=false`, `ORACLE_QUORUM_FAILED` |
| Invalid signature | Drop attestation (not counted) |
| Duplicate oracleId | Single count |
| Quorum met but NodeChain append fails | **Fail closed** — do not report soft ok |
| Process requires oracle but step skipped | **Forbidden** |

Orchestrator maps gateway failure to **process expired** path (Canon §XII).

---

## Separation of duties

| Authority | Owner |
|-----------|--------|
| Official institutional valuation for mint | Institution + process package + PoT |
| Transport quorum of external attestations | Oracle Gateway |
| Fact of execution / verified | PoT |
| Durable truth | NodeChain |
| Observation of failures | All-Seeing Eye |

```text
Gateway ok  ⇏  verified = 1
Gateway ok  ⇏  mint authorized
Gateway fail ⇒  process must not continue economic path
```

---

## Explicit non-goals

- AST-authored institutional valuation  
- Price discovery UI presented as official valuation  
- Single unauthenticated feed as sole trust  
- Admin override “force ok”  
- Replacing PoT criteria P1–P4  

---

## Threat notes (v1)

| Threat | Mitigation |
|--------|------------|
| Single compromised oracle | `requiredCount ≥ 2` default |
| Replay / double-count same oracle | Dedupe by `oracleId` |
| Soft-continue on failure | Fail-closed + expired process |
| Silent accept without ledger | Append required on accept; fail if append fails |
