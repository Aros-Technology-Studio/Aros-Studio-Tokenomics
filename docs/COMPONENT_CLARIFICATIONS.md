# Component Clarifications (owner questionnaire)

**Status:** P0 + P1 answers **canonical for v1** (owner; Core Canon v1.0 Final)  
**Language:** English in repo; product owner may answer in Russian in chat.  
**Canon:** `/CANON.md`  
**Principle:** [ANTI_POLICE.md](./principles/ANTI_POLICE.md)

Changes to these answers require formal canon amendment.

---

# P0 — CANONICAL (summary)

| Component | Pack |
|-----------|------|
| `invariants` | ready — pure+guards, fail closed, I1–I9 CI, no Eye veto |
| `pot` | ready — M-of-N, final verified, NodeChain before emission, no amounts |
| `reserve` | ready — multi-asset own books, bag, reserveIndex, NodeChain primary |
| `aroscoin` | ready — ARO/9, emission-after-PoT only, no admin mint |

Full text: historical sections below were replaced by pack files; P0 detail remains in `docs/components/{invariants,pot,reserve,aroscoin}/` and prior commit history.

---

# P1 — CANONICAL ANSWERS (v1)

## 5. `nodechain`

1. Data model?  
   `A:` **Linear append-only log** as the main chain. DAG allowed only **inside one processId** as internal representation.

2. Storage v1?  
   `A:` **Primary:** own append-only ledger (RocksDB/BadgerDB). **Secondary:** Postgres for indexes/search only (mirror, not SoT).

3. Word “blocks”?  
   `A:` **Forbidden** in public API, docs, and code. Use: snapshot, execution record, state entry.

4. Sharding v1?  
   `A:` **No.** Single shard. Sharding v2+.

5. Encryption at rest v1?  
   `A:` **Required** for all sensitive data.

6. Who may append?  
   `A:` **Internal services with roles** + quorum validators. Direct append from arbitrary nodes forbidden.

7. Read API?  
   `A:` Institutions: **own processes only** (by claimId/processId). Full history: Eye + authorized audit only.

8. Finality?  
   `A:` **Immediately immutable** (append-only). Soft finality not allowed.

9. Link to PoT/ArosCoin?  
   `A:` **Content hashes** (primary) + processId for navigation.

10. BFT inside NodeChain v1?  
    `A:` **Later.** v1: PoT + quorum validators suffice.

---

## 6. `nodes`

1. Identity?  
   `A:` **Both** — institutional certificate (qualified e-signature / X.509) + key pair.

2. Registration?  
   `A:` **Manual approval** + allowlist for known institutions.

3. Auth?  
   `A:` **mTLS + signed challenges** (primary). JWT only for internal services.

4. Roles?  
   `A:` **Fixed set** for v1 (executor, confirmer/validator, observer).

5. Suspend without slashing?  
   `A:` Reputation decrease + temporary exclusion from quorum (grace period).

6. Uptime / heartbeats?  
   `A:` Heartbeats required. Min uptime configurable (default **95%**).

7. Geo / jurisdiction?  
   `A:` **Yes**, configurable (compliance).

8. Node payment?  
   `A:` **ARO** post-factum via commission pool.

9. API surface?  
   `A:` Minimum: register, auth, heartbeat, task assignment.

10. Multi-node per institution?  
    `A:` **Allowed** under one institutional certificate.

---

## 7. `emission`

1. Amount inputs?  
   `A:` **Institutional valuation** (primary) + **ΔValue** (confirmed change).

2. Old `T_E = α·TV + β·U + γ`?  
   `A:` **Replaced** by valuation + ΔValue.

3. Output unit?  
   `A:` **ARO**.

4. Rounding?  
   `A:` **Floor** to minimum unit (9 decimals / arx).

5. Deterministic / replayable?  
   `A:` **Yes** — strictly from NodeChain inputs only.

6. Caps?  
   `A:` **Yes**, configurable per asset class.

7. Calls mint?  
   `A:` Calls **`aroscoin.mint`** after successful PoT (not DTO-only).

8. Zero/negative ΔValue?  
   `A:` **Emit zero** or **burn path** (per asset policy).

9. Who changes parameters?  
   `A:` **Only canon change** + governance.

10. Pro-rata (I9)?  
    `A:` **Emission service** computes and invokes mint.

---

## 8. `commission` (settlement / post-factum)

1. Fee schedules?  
   `A:` **Multiple** (per asset class).

2. Fee base?  
   `A:` **Valuation** (institutional).

3. Split nodes vs AST reserve?  
   `A:` Configurable ratios (default **70/30** or per policy).

4. When taken?  
   `A:` **On PoT** (after confirmation).

5. Currency?  
   `A:` **ARO**.

6. Commission fate?  
   `A:` Redistribute to nodes + accrue to AST reserve.

7. Waivers / tiers v1?  
   `A:` **Yes**, configurable.

8. NodeChain visibility?  
   `A:` **Mandatory**.

9. API vocabulary?  
   `A:` Owner intent: settlement + node distribution; avoid payout/compensation-style naming.  
   **Repo resolution (mandatory):** vocabulary gate + Core Canon require post-factum **payment** language.  
   Canonical API names for v1: **`settleCommission`**, **`distributeNodePayment`**. Do not ship banned-token identifiers (see `canon-gate.sh`).

10. v1 scope?  
    `A:` **Full distribution engine** (simple).

---

## 9. `all-seeing-eye`

1. Scope?  
   `A:` **All events** (variable analysis depth).

2. Notify mode?  
   `A:` **Async batch audit** + **critical sync alerts**.

3. Consumers v1?  
   `A:` **Ops human + orchestrator**.

4. Reason codes?  
   `A:` **Yes**, standardized.

5. Fail-closed owner?  
   `A:` **Executing module** itself (not Eye).

6. Deployment shape?  
   `A:` **Separate process** (independence).

7. Log store?  
   `A:` **NodeChain primary** + mirrored analytic store.

8. Disable?  
   `A:` Allowed in **dev/test**; **never in prod**.

9. Ban list extras?  
   `A:` Ban list is for **monitoring only** (Eye never mint/burn/pay/veto/rollback). No extra executive powers.

10. AI hierarchy?  
    `A:` **Yes** — parallel observation plane only.

---

# P2–P3 — QUESTIONS (later)

`orchestrator`, `state-recording`, `release`, `common` — 10 each; open after P1 packs.

---

## Mapping to packs

| Component | Pack status |
|-----------|-------------|
| P0 four | ready |
| `nodechain` | ready |
| `nodes` | ready |
| `emission` | ready |
| `commission` | ready |
| `all-seeing-eye` | ready |
