# Owner review — 01_NodeChain (B1)

**Date prepared:** 2026-07-30  
**Purpose:** Product-owner sign-off that NodeChain **v1 pilot** docs + implementation meet acceptance (no fake Done).  
**Law:** Core Canon · this layer tree · `VOCABULARY.md`  

---

## 1. Verdict requested from owner

| Decision | Meaning |
|----------|---------|
| **Approve B1** | Docs + implementation are accepted for pilot; residual ops tracked as B2–B4 only |
| **Reject / amend** | List gaps; do not check “Owner review pass” |

Reply in chat: **`B1 approved`** or list amendments.

---

## 2. Documentation checklist (evidence)

| Item | Path / note | Status |
|------|-------------|--------|
| Scope / non-goals / boundaries | `00_scope/` | Written |
| Ledger model, hash chain, write/read | `01_ledger/` | Written |
| Network nodes vs chain nodes | `02_identity_and_nodes/` + **`VOCABULARY.md`** | Written |
| Crypto, process binding, network, storage | `03`–`06` | Written |
| Integrity, API, acceptance | `07`–`09` | Written |
| Assembly run book | `ASSEMBLY.md` | Written (+ Nodes list API) |
| Product vocabulary (no “blocks” API) | `VOCABULARY.md`, `08_api/query-api.md` | Written |

---

## 3. Implementation checklist (evidence)

| Item | Evidence | Status |
|------|----------|--------|
| Append + height + crash-safe | `src/nodechain/*` file/rocksdb; tests | **Pass** |
| Hash chain verify | `verifyChain`, CLI, HTTP | **Pass** |
| Immutability | no update/delete API | **Pass** |
| Idempotent `clientRecordId` | service + tests | **Pass** |
| Ed25519 on contentHash | KeyRegistry / KeyProvider | **Pass** |
| Index mirror non-SoT | `src/index-mirror`, `docs/db/` | **Pass** (optional) |
| Kill-switch read-only | `src/hardening` | **Pass** |
| HTTP `/v1/core/nodechain/*` | status, tip, verify, records, **nodes**, processes, genesis | **Pass** |
| Boot genesis | `NodechainBootstrap` | **Pass** |
| CLI | genesis, first-record, status, tip, verify, dump | **Pass** |
| Tests | Jest `nodechain` + `core-api` | **15 tests green** (2026-07-30) |
| Guards | `npm run check:canon` | **ALL OK** |

### Hands-on smoke (file engine)

```bash
cd /path/to/Aros-Studio-Tokenomics
npm run journal:first -- --dir /tmp/ast-b1-review-file --engine file
# expect genesis height 0 + first record height 1, chain.ok: true
```

Recorded sample: chain height **1**, `chain.ok: true` (file engine, 2026-07-30).

---

## 4. Explicit residual (not part of B1 “pilot accept”)

These stay open; tracked as completion items **B2–B4**:

| ID | Residual | Why not blocking pilot review |
|----|----------|-------------------------------|
| **B2** | Encryption at rest (journal payload) | **Done** — AES-256-GCM for file/rocksdb (`at-rest.ts`) |
| **B3** | Institution read scoping on Core HTTP | **Done** — institution sees own processId only; ops token full |
| **B4** | Durable observer event stream | **Done** — `observer-events.jsonl` + `GET /v1/core/eye/stream` |

Owner may **approve B1** with residual ops closed for B2–B4.

---

## 5. Explicit non-goals (still true)

- PoT, token math, commission, portal mint  
- Multi-writer BFT consensus  
- Product-API “blocks” (forbidden; use **nodes**)

---

## 6. Sign-off block

| Field | Value |
|-------|--------|
| Reviewer (owner) | ________________ |
| Date | ________________ |
| Decision | Approve / Amend |
| Notes | ________________ |

**Repo action after approve:** check `[x] Owner review pass` in `acceptance-criteria.md` and log B1 in `docs/COMPLETION-TRACK.md`.
