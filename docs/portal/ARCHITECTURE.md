# Institutional Portal — Architecture (edge)

**Status:** scaffold (owner re-opened edge scope)  
**Location:** `portal/`  
**Role:** Institutional submission UX and edge API. **Not** the source of truth.

## Boundary (Core Canon)

| Portal edge **may** | Portal edge **must not** |
|---------------------|---------------------------|
| Collect institutional valuation (decimal string) | Appraise assets or invent valuation |
| Collect document package + **qualified signature** evidence | Mint / burn / transfer ARO |
| Issue / validate `processId` + `idempotencyKey` | Bypass PoT or write economic facts as SoT |
| Call Core Orchestrator / intake pipeline | Hold third-party funds |
| Show process status from Core / index mirror | All-Seeing Eye veto or rollback |
| Fail closed if valuation or КЭП missing | Free mint (forbidden) / emission without PoT |

NodeChain remains sole economic SoT. Portal is a **client edge** of the Orchestrator.

## Layout

```
portal/
  docs/                 → pointer to this architecture (see also docs/portal/)
  openapi/openapi.yaml  → edge contract
  shared/               → processId, idempotency, DTOs (no Nest/Next deps)
  backend/              → NestJS edge BFF (stub → Core)
  frontend/             → Next.js institutional UI shell
  package.json          → workspace scripts
  README.md
```

## Identity & keys (Orchestrator alignment)

### processId

Pattern (Core Canon §XII / P2 orchestrator):

```
AST-{INST}-{YYYYMMDD}-{suffix}
```

- `INST` — institution code, `A-Z0-9`, max 16  
- `YYYYMMDD` — UTC date of open  
- `suffix` — opaque id (UUIDv7 fragment or hex); v1 accepts alnum suffix matching core `isValidProcessId`

Shared helper: `portal/shared/src/process-id.ts` (mirrors core intake rules).

### idempotencyKey

- **Mandatory** on all mutating portal APIs (`Idempotency-Key` header or body field).  
- Scope: per institution + operation type.  
- Same key + same payload → same `processId` / same accepted response (no double open).  
- Same key + different payload → `409 IDEMPOTENCY_PAYLOAD_MISMATCH`.

### Correlation

| Field | Owner |
|-------|--------|
| `processId` | Portal may propose; Core validates & journals |
| `idempotencyKey` | Portal client; Core/Orchestrator enforces |
| `payloadHash` | Core TxEncoding after accept |
| `institutionId` | Cert / allowlist (L1) |

## Required admission inputs (stub enforced)

Every process-start stub **rejects** unless:

1. **Institutional valuation** — decimal string, max 9 fraction digits (no JSON number money).  
2. **Qualified signature** — `hasQualifiedSignature: true` + signature material / package hash.  
3. **Document package** — non-empty docs or `documentPackageHash` (64 hex).  
4. **idempotencyKey** — non-empty.  
5. **processId** — valid pattern if client-supplied; else server generates.

These gate the **edge**. Core still runs L1/L2/PoT/L3 before any mint.

## API surface (v1 stub)

See [`portal/openapi/openapi.yaml`](../../portal/openapi/openapi.yaml).

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v1/processes` | Open primary tokenization submission |
| `GET` | `/v1/processes/{processId}` | Status from edge store / Core hand-off |
| `POST` | `/v1/processes/{processId}/documents` | Attach / replace document package meta |
| `GET` | `/v1/health` | Liveness |

Responses never claim mint complete unless Core Orchestrator returned a settled result (stub returns `accepted` / `awaiting_core` only).

## Runtime topology

```
[Next.js portal/frontend]
        │ HTTPS
        ▼
[Nest portal/backend]  ──OpenAPI──► edge validation
        │
        │  (future) gRPC/HTTP internal
        ▼
[Core: TokenizationPipeline / Orchestrator]
        │
        ▼
[NodeChain journal SoT]
```

v1 scaffold: backend **stubs** Core hand-off (in-memory accept log). Wiring to `TokenizationPipeline` is a follow-on; no side-effect mint from portal alone.

## Security notes

- TLS at edge in deploy.  
- Institution auth (mTLS / OID / cert) — placeholder `X-Institution-Id` header in stub.  
- No private keys of NodeChain writers in the browser.  
- Portal service account may hold only **orchestrator submit** credentials — must not hold economic signer keys that could mint without PoT.

## Non-goals (scaffold)

- Full КЭП/X.509 crypto validation (flag + hash only)  
- Production SSO  
- Wallet connect / public retail UI  
- All-Seeing Eye executive actions  
