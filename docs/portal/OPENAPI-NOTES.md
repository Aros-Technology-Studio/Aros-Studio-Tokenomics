# Portal OpenAPI — alignment notes

Source draft from product (tokenization/start, documents/upload, assets) merged into  
`portal/openapi/openapi.yaml` with **AST-CORE-CANON** constraints.

## Differences from raw draft

| Draft | Canon / portal v1 |
|-------|-------------------|
| `processId` UUID | **`AST-{INST}-{YYYYMMDD}-{suffix}`** |
| Server `:3001/v1` | Portal edge **`:3100`**, paths include `/v1/...` |
| Bearer + mTLS required | **Session** `X-Session-Id` now; JWT/mTLS documented as target |
| `currency` drives mint | Metadata only; process unit is **ARO** valuation string |
| `tokenSupply` always | Only when Core returns mint; else null |
| Full КЭП crypto on upload | Signature **attestation** + SHA-256; X.509 chain follow-on |
| Public mint surfaces | **None** — hand-off to Core only |

## Implemented product paths

- `POST /v1/tokenization/start` → primary tokenization edge + Core hand-off  
- `POST /v1/documents/upload` → signature + hash attach to process  
- `GET /v1/assets`, `GET /v1/assets/{claimId}`  
- Legacy: `POST /v1/processes`, `POST /v1/documents/hash` still supported  
