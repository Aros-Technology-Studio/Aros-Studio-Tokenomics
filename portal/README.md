# Institutional Portal

**Status:** Scaffold + architecture  
**Docs:** `docs/architecture/INSTITUTIONAL_PORTAL.md`  
**OpenAPI:** `portal/openapi/openapi.yaml`

Human-facing entry for institutional participants. Economic work always goes through **core Orchestrator** (PoT → NodeChain → Emission → Settlement). Portal never appraises assets and never bypasses PoT/NodeChain.

## Layout

```
portal/
├── frontend/     # Next.js 15 (App Router) + TypeScript + Tailwind
├── backend/      # NestJS Portal API (/v1)
├── shared/       # Shared TypeScript types
├── openapi/      # OpenAPI 3.1
└── README.md
```

## Principles

1. **КЭП / qualified e-signature** required on document upload.  
2. **Institutional valuation** supplied by participant — not computed by AST.  
3. **processId** = `AST-{INST}-{YYYYMMDD}-` + UUIDv7.  
4. **idempotencyKey** required on `POST /tokenization/start`.  
5. Minimal UI; own-data scoping only.

## Local (later)

```bash
# backend
cd portal/backend && npm install && npm run dev

# frontend
cd portal/frontend && npm install && npm run dev
```

Core AST Nest app remains at repository root `src/` (engines). Portal backend is a **separate edge service** under `portal/backend`.
