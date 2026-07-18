# Intake (institutional process)

**ENV/DOC related:** process entry for asset tokenization.  
**Portal edge (scaffold):** `portal/` + [`docs/portal/ARCHITECTURE.md`](./portal/ARCHITECTURE.md).

## Path (Core)

1. Institution package: valuation + documents + qualified signature flags  
2. Governance **L1** (allowlist, docs, signature)  
3. **L2** committee when required  
4. `TokenizationPipeline.runPrimaryTokenization` (layer 10)  
5. PoT P1–P4 → mint → commission 70/30 → reserve  
6. All-Seeing Eye observe/notify  

## Portal edge path (scaffold)

1. Institution submits via portal frontend → Nest edge (`POST /v1/processes`)  
2. Edge **requires** valuation (decimal string), `documentPackageHash`, `hasQualifiedSignature: true`, `Idempotency-Key`, `X-Institution-Id`  
3. `processId` = `AST-{INST}-{YYYYMMDD}-{suffix}` (client or edge-generated)  
4. Status `awaiting_core` — **stub** until wired to Orchestrator / `TokenizationPipeline`  
5. **No mint** at edge; Core remains SoT  

OpenAPI: `portal/openapi/openapi.yaml`

## CLI (Core, no UI)

```bash
npm run demo:tokenize -- --dir data/journal-rocks --engine rocksdb
```

## Signature verification (v1)

Flags `hasQualifiedSignature` / allowlist are process inputs.  
Production КЭП/X.509 validation is a follow-on (bind to nodes registration + intake policy).  
Portal edge currently enforces the **flag + package hash**, not full X.509 crypto.
