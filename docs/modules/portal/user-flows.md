# Portal — user flows

**Canon:** §5.2 primary tokenization; Orchestrator sole entry  
**Architecture:** INSTITUTIONAL_PORTAL §6  
**Related process:** `docs/processes/primary-tokenization.md`

---

## 1. Login

```text
Institutional user
  → Open portal
  → mTLS + institutional certificate handshake
  → Portal issues short-lived session JWT
  → Dashboard
```

| Fail | Outcome |
|------|---------|
| No / invalid cert | Access denied |
| Cert not enrolled | Onboarding required |

---

## 2. Primary tokenization (happy path)

```text
Dashboard → New tokenization
  → Form:
       assetType
       institutionalValuation   ← institution provides (AST does NOT compute)
       currency
       metadata / holder
  → POST /v1/tokenization/start { idempotencyKey, ... }
       → Core Orchestrator StartProcess
       → processId = AST-{INST}-{YYYYMMDD}-<UUIDv7>
  → For each document:
       local signature prepare/verify (Web Crypto / КЭП)
       POST /v1/documents/upload { file, processId, signature }
       without valid signature: reject; stay documents_pending
  → Pipeline (core):
       Document validation → (Oracle if required) → PoT → NodeChain
       → Emission → Settlement → State → End
  → Poll GET /v1/processes/{processId}
  → completed → claimId + holdings on My Assets
  → History: scoped NodeChain-derived audit view
```

### Flow rules

1. Invalid/missing КЭП → document not accepted; process cannot complete PoT P1–P4.  
2. User cannot skip PoT/NodeChain.  
3. Significant states write-ahead to NodeChain before durable “completed.”  
4. Institution reads **own** processes/assets only.  
5. Retries of start reuse the **same** `idempotencyKey`.  
6. Concurrent processes capped at **10** per institution (Orchestrator).  

---

## 3. Tokenization — failure paths (user-visible)

| Situation | UI / status |
|-----------|-------------|
| Validation errors on form | Stay on form; 400 |
| Concurrent limit | Error; try later |
| Signature rejected | Stay `documents_pending` / upload error |
| Oracle required & fail | `expired` (fail-closed) |
| PoT fail | `failed` or non-verified; no mint |
| Process timeout 30m | `expired` / `failed` |
| Settlement lag after mint | May show settling; core retries settle (no burn) |

---

## 4. View assets

```text
Dashboard / Assets
  → GET /v1/assets
  → Open claim → GET /v1/assets/{claimId}
  → Detail: institutional valuation snapshot, claim ids, status
```

No “edit price in AST” control. Revaluation is a **new process** with new institutional confirmation (see process docs).

---

## 5. History

```text
History
  → Scoped events derived from NodeChain for own processes
  → Not a global Eye console (ops use Eye separately)
```

---

## 6. Partial release (later UI)

```text
Assets → claim → Request partial release
  → Holder request + institutional approval
  → Orchestrator StartProcess (NEW processId)
  → Full pipeline + atomic burn + reserve child + remint
  → Pre–Release Phase: internal only
```

Does **not** activate system-wide Release Phase. See `docs/modules/release/partial-release.md`.

---

## 7. Profile / certificates

```text
Profile
  → View institutional certificates
  → Status of enrollment / expiry (informational)
```

Certificate governance (allowlist) is ops/governance, not self-service elevation.

---

## What users never do in Portal

| Action | Why |
|--------|-----|
| Appraise assets for AST | Canon §5.1 |
| Mint without process | Sole entry + PoT |
| Toggle Release Phase | System + governance + daemon |
| Veto other institutions’ processes | No Eye executive; no cross-tenant control |
| Stake / farm ARO | Hard prohibition §X |

---

## End-to-end diagram (compact)

```text
[User] --cert--> [Portal FE] --> [Portal API]
                                    |
                                    v
                              [Orchestrator]
                               /    |     \
                            PoT  NodeChain  Emission/Settle
                                    |
                                 [Assets UI]
```
