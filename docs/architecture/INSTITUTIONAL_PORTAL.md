# Institutional Portal — Architecture

**Status:** Draft aligned to Core Canon v1.0 + P0–P4  
**Code tree:** `/portal`  
**Canon:** `/CANON.md`  
**Orchestrator pack:** `docs/components/orchestrator/`

---

## 1. Concept

The **Institutional Portal** is the **only human-facing entry** for institutional participants (and authorized public bodies) into AST.

| Requirement | Canon / decision link |
|-------------|----------------------|
| Mandatory qualified e-signature (КЭП) on document upload | CANON §5.2; P1 nodes/cert |
| Minimal UI | product UX |
| No economic side doors | Orchestrator = sole economic cycle entry |
| No asset appraisal by AST | CANON §5.1 — institutional valuation only |
| PoT + NodeChain never bypassed | CANON §4.1–4.2, §X |
| Process states recorded before client-visible completion | write-ahead / NodeChain |

Portal **does not** implement PoT, emission, reserve, or ledger. It is an **edge orchestrator client**: auth, forms, uploads, status views → **Portal API** → **core Orchestrator**.

---

## 2. System context

```
[Institution browser]
        │  mTLS + institutional certificate
        │  session token after auth (browser)
        ▼
[portal/frontend]  Next.js 15
        │  HTTPS JSON / multipart
        ▼
[portal/backend]   NestJS Portal API  (prefix /v1)
        │  internal calls only
        ▼
[core Orchestrator] ──► PoT / NodeChain / Emission / …
        │
        ▼
   NodeChain (SoT)
```

**Forbidden:** frontend or Portal API calling mint/settle/pot “directly” without Orchestrator process.

---

## 3. Stack (v1 decision)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | **Next.js 15** App Router + TypeScript | modern institutional UI |
| UI | Tailwind + shadcn/ui | minimal, consistent |
| Client state | Zustand | simple |
| Signatures | Web Crypto API + КЭП integration | mandatory signature |
| Portal API | **NestJS** (not Go in v1) | same language/runtime as core AST Nest stack |
| Shared types | `portal/shared` | FE/BE contract |
| Auth edge | **mTLS + institutional cert**; short-lived **session JWT** for browser after login | aligns with cert-first identity; JWT is session only, not node-edge auth |

---

## 4. Frontend routes

| Area | Path | Role |
|------|------|------|
| Landing | `/` | redirect / public minimal |
| Auth | `/(auth)/login` | cert / mTLS handshake UX |
| Dashboard | `/(dashboard)` | assets + tokens overview |
| Assets | `/(dashboard)/assets`, `.../[claimId]` | tokenized assets (own only) |
| Tokenization | `/(dashboard)/tokenization`, `.../[processId]` | new process + status |
| History | `/(dashboard)/history` | NodeChain-derived events (scoped) |
| Profile | `/(dashboard)/profile` | certificates |

**Partial release (later UI):** holder request under assets — still full Orchestrator process (`partial-release` pack).

---

## 5. Portal API (surface only)

Global prefix: `/v1`.  
Business truth remains core + NodeChain.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/tokenization/start` | StartProcess via Orchestrator (`idempotencyKey` required) |
| `POST` | `/documents/upload` | Upload + **mandatory** qualified signature |
| `GET` | `/processes/{processId}` | Status (own processes only) |
| `GET` | `/assets` | Own tokenized assets |
| `GET` | `/assets/{claimId}` | Asset detail (own only) |
| `GET` | `/health` | Liveness |

Full OpenAPI: `portal/openapi/openapi.yaml`.

### processId

Not a bare UUID. Canon/orchestrator:

```text
AST-{INST}-{YYYYMMDD}-<UUIDv7>
```

OpenAPI uses `string` with pattern description (not `format: uuid` alone).

### Process status (portal view model)

Maps from orchestrator pipeline (subset for UI):

| UI status | Meaning |
|-----------|---------|
| `created` | StartProcess done |
| `documents_pending` | awaiting valid signed docs |
| `validating` | document/signature validation |
| `pot_pending` | PoT evaluation |
| `settling` | emission/settlement in flight |
| `completed` | EndProcess success |
| `failed` | terminal fail (+ compensation if pre-verified) |
| `expired` | timeout / oracle fail-closed |

---

## 6. Primary tokenization user flow

```
Institutional user
  → Login (mTLS + institutional certificate → session)
  → Dashboard → New tokenization
  → Form: assetType, institutionalValuation, currency, metadata
       (AST does NOT compute valuation)
  → POST /tokenization/start  { idempotencyKey, ... }
       → Orchestrator StartProcess → processId
  → Upload each document + qualified e-signature
       → local verify (Web Crypto) → POST /documents/upload
       → without valid signature: reject (process stays documents_pending)
  → Portal API forwards to core pipeline
       → Document validation → (Oracle?) → PoT → NodeChain → Emission → Settlement → …
  → Poll/stream GET /processes/{processId}
  → On completed: claimId + holdings on My Assets
  → History: scoped NodeChain-derived audit view
```

### Flow rules

1. Invalid/missing КЭП → document not accepted; process cannot complete PoT criteria P1–P4.  
2. User cannot skip PoT/NodeChain.  
3. Significant states write-ahead to NodeChain per core rules before durable “completed” is shown.  
4. Institution reads **own** processes/assets only (Eye/audit full history elsewhere).

---

## 7. Folder structure (`/portal`)

See live tree under repository `portal/`. Summary:

```
portal/
├── frontend/          # Next.js 15
├── backend/           # NestJS Portal API
├── shared/            # shared types
├── openapi/           # OpenAPI 3.1
└── README.md
```

---

## 8. Canon compliance checklist (portal)

- [x] No self-appraisal UI (“price calculator”)  
- [x] Institutional valuation required on start  
- [x] КЭП mandatory on documents  
- [x] Sole economic entry via Orchestrator  
- [x] NestJS portal API thin edge  
- [x] processId prefix pattern  
- [x] Own-data scoping  
- [ ] Implementation (scaffold only until coded)  

---

## 9. Non-goals (v1 portal)

- Public retail trading UI  
- Admin god-mint screens  
- Embedding PoT/NodeChain engines inside Next.js  
- Service mesh / Cilium (ops later)  
