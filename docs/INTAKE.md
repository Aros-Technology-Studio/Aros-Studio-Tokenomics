# Intake (institutional process)

**ENV/DOC related:** process entry for asset tokenization.  
**Portal edge (v1 institutional):** `portal/` + [`docs/portal/ARCHITECTURE.md`](./portal/ARCHITECTURE.md).

## Path (Core)

1. Institution package: valuation + documents + qualified signature flags  
2. Governance **L1** (allowlist, docs, signature)  
3. **L2** committee when required  
4. `TokenizationPipeline.runPrimaryTokenization` (layer 10)  
5. PoT P1–P4 → mint → commission 70/30 → reserve  
6. All-Seeing Eye observe/notify  

## Portal edge path (v1)

1. Institution logs in (`POST /v1/auth/login`) → session (`X-Session-Id`)  
2. Hash document package (`POST /v1/documents/hash`) → SHA-256 hex  
3. Submit via UI or edge (`POST /v1/processes`) with valuation, hash, `hasQualifiedSignature: true`, `Idempotency-Key`  
4. Edge hands off to Core Orchestrator (`CORE_API_URL`); session institution binds process  
5. `processId` = `AST-{INST}-{YYYYMMDD}-{suffix}`  
6. Status: edge list + Core merge (`GET /v1/processes/:id`)  
7. **No mint** at edge; Core remains SoT  

OpenAPI: `portal/openapi/openapi.yaml`  
UI: `http://localhost:3200` (Next.js) · Edge: `:3100` · Core: `:3000`

## CLI (Core, no UI)

```bash
npm run demo:tokenize -- --dir data/journal-rocks --engine rocksdb
```

## Signature verification (v1)

Flags `hasQualifiedSignature` / allowlist are process inputs.  
Production КЭП/X.509 validation is a follow-on (bind to nodes registration + intake policy).  
Portal edge currently enforces the **flag + package hash**, not full X.509 crypto.
