# Institutional Portal — Target Structure

**Status:** Target layout (v1.1)  
**Location:** `portal/`  
**Role:** AFC-side institutional edge. **Not** NodeChain SoT. **No mint** on portal.

## Target tree

```
portal/
├── frontend/                    # Next.js 15 App Router + TypeScript
│   ├── app/
│   │   ├── (auth)/              # login only
│   │   ├── (dashboard)/         # authenticated cabinet (route group)
│   │   │   ├── dashboard/       # → /dashboard
│   │   │   ├── assets/          # → /assets (claims, read-only)
│   │   │   ├── tokenization/    # → /tokenization + /tokenization/[id]
│   │   │   └── history/         # → /history
│   │   ├── layout.tsx
│   │   └── page.tsx             # landing → /

│   ├── components/
│   ├── lib/                     # api, auth session, crypto helpers
│   ├── types/
│   └── public/
├── backend/                     # NestJS BFF
│   └── src/
│       ├── modules/             # auth, tokenization, assets, documents, processes, health
│       ├── common/              # guards, filters (follow-on)
│       ├── config/
│       └── main.ts
├── shared/                      # types + admission validation
├── openapi/
└── README.md
```

## Canon map (what each area may do)

| Area | May | Must not |
|------|-----|----------|
| auth | Institution login / session | Self-signup retail |
| tokenization | Submit primary package, status | Mint / burn / transfer ARO |
| assets | List claims / process-linked packages (read) | Appraise or invent valuation |
| documents | Hash package at edge | Long-term SoT document store |
| processes | Edge track + Core hand-off | Rewrite NodeChain |
| history | Institution-scoped audit of edge submits | Eye veto / rollback UI |
| health | Liveness + Core reachability | Business secrets |

## Stack notes

- **UI:** Next.js App Router. Design system (Tailwind / shadcn) is optional polish phase; structure first.
- **BFF:** NestJS modules under `src/modules/`.
- **Shared:** processId, amounts, create-body validation aligned with Core.
- **Core:** only via `CORE_API_URL` Orchestrator.

## Migration

Existing flat `portal/frontend/app/*` and `portal/backend/src/*` reorganize into this tree without changing API contracts (`/v1/auth`, `/v1/processes`, `/v1/documents`, `/v1/health`).
