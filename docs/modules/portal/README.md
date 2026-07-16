# Institutional Portal module

**Code tree:** `portal/`  
**Canon:** `docs/AST-CORE-CANON.md` §5.1–5.2, §X  
**Architecture:** `docs/PORTAL.md`, `docs/architecture/INSTITUTIONAL_PORTAL.md`  
**OpenAPI:** `portal/openapi/openapi.yaml`

---

## Role

The **Institutional Portal** is the **only human-facing entry** for institutional participants (and authorized public bodies) into AST.

It is an **edge Orchestrator client**:

```text
Browser (mTLS + institutional cert + session)
  → portal/frontend (Next.js)
  → portal/backend (NestJS Portal API /v1)
  → core Orchestrator
  → PoT / NodeChain / Emission / …
```

| Does | Does not |
|------|----------|
| Auth, forms, uploads, status views | Implement PoT |
| Require КЭП on document upload | Implement emission / mint |
| Forward economic starts to Orchestrator | Invent asset prices |
| Show own assets / processes | Be a valuation UI |
| Expose OpenAPI edge contract | Call mint/settle/pot as public side doors |

---

## Canon constraints

| Constraint | Link |
|------------|------|
| AST does not appraise assets | §5.1 |
| Official institutional valuation + qualified signature | §5.2 |
| Orchestrator sole economic entry | P2; orchestrator pack |
| No PoT / NodeChain bypass | §4.1–4.2, §X |
| Selective custody — not a bank UI for third-party funds | §4.4 |

---

## Stack (v1)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 App Router + TypeScript |
| UI | Tailwind + shadcn/ui (minimal) |
| Client state | Zustand |
| Signatures | Web Crypto API + КЭП integration |
| Portal API | NestJS, global prefix `/v1` |
| Shared types | `portal/shared` |
| Auth | mTLS + institutional cert; short-lived session JWT for browser |

---

## Repository layout

```text
portal/
  frontend/     Next.js app
  backend/      NestJS Portal API
  openapi/      openapi.yaml
  shared/       FE/BE contracts
  README.md
```

---

## Module docs in this folder

| File | Topic |
|------|--------|
| [frontend.md](./frontend.md) | Routes, UX boundaries |
| [backend.md](./backend.md) | Portal API Nest edge |
| [digital-signature.md](./digital-signature.md) | Mandatory КЭП |
| [user-flows.md](./user-flows.md) | Tokenization and related flows |
| [api.md](./api.md) | OpenAPI surface summary |

---

## Related

- Core Orchestrator API: `docs/modules/orchestrator/api.md`  
- Partial release UI later under assets — still full Orchestrator process  
