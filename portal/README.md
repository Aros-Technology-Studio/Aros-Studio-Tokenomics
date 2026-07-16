# Institutional Portal (Issuer entry)

**Status:** Edge scaffold wired to core API  
**Docs:** `docs/architecture/INSTITUTIONAL_PORTAL.md`, `docs/INTAKE.md`, `docs/modules/portal/`  
**OpenAPI:** `portal/openapi/openapi.yaml`

Mandatory **human-facing single entry** for institutional issuers. Economic work always goes through **core Orchestrator** (PoT → NodeChain → Emission → Settlement). Portal never appraises assets and never bypasses PoT/NodeChain.

## Layout

```
portal/
├── frontend/     # Next.js App Router — dashboard + tokenization UI
├── backend/      # NestJS Portal API (/v1) — edge only
├── shared/       # Shared TypeScript types
├── openapi/      # OpenAPI 3.1
└── README.md
```

## Issuer flows

| Flow | Path |
|------|------|
| Health | `GET /health` |
| Document + КЭП | `POST /documents/upload` (signature required) |
| Start tokenization | `POST /tokenization/start` → core Orchestrator |
| Process status | `GET /processes/:id` via core client |
| Assets / history | dashboard pages (own-data scope) |

## Principles

1. **КЭП / qualified e-signature** required on document upload.  
2. **Institutional valuation** supplied by participant — not computed by AST.  
3. **processId** = `AST-{INST}-{YYYYMMDD}-` + UUIDv7.  
4. **idempotencyKey** required on start.  
5. Minimal UI; own-data scoping only.  
6. Portal is **edge** — not a second economic core.

## Local

```bash
# core API (repo root)
npm run dev

# portal backend
cd portal/backend && npm install && npm run dev

# portal frontend
cd portal/frontend && npm install && npm run dev
```

## Related issues closed as v1 edge path

Interface issuer_portal + LAYER 10 intake map to this portal + `docs/INTAKE.md` + orchestrator pipeline (not a separate `10_*` binary).
