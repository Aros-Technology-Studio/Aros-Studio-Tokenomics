# 02_TxEncoding

**Layer:** Deterministic transaction / process payload encoding  
**Code:** `src/tx-encoding/`  
**Role:** One encoding → one digest (determinism). Prepares the object PoT and NodeChain will reference. **No mint, no fee, no PoT verdict.**

## Deliverables

| Concern | Implementation |
|---------|----------------|
| Schema per process type | `schema.ts` |
| Canonical JSON | `canonical.ts` (sorted keys, no float amounts) |
| Hash | SHA-256 of UTF-8 encoded envelope |
| Encode / decode / verify | `encode.ts` |
| Package ed25519 bind | `EncodingService.signPackage` |
| Service | `EncodingService` |

## Process schemas

- `primary_tokenization` — institutionId, valuation, holderId  
- `revaluation` — institutionId, assetId, previousValue, newValue  
- `ownership_transfer` — institutionId, assetId, from/to, amount  

Amounts are **decimal strings** (max 9 fraction digits). Numbers forbidden.

## Layout

```
src/tx-encoding/
  index.ts
  types.ts
  errors.ts
  schema.ts
  canonical.ts
  hash.ts
  encode.ts
  encoding.service.ts
  encode.spec.ts
```

## Invariants

1. **Determinism** — same logical input → same `encoded` + `payloadHash` regardless of object key order  
2. **No float money** — amounts are decimal strings (≤9 fraction digits); JSON numbers for money rejected  
3. **Schema closed by default** — unknown body keys → `TX_SCHEMA` with `forbidden field`  
4. **processId format** — `AST-{INST}-{YYYYMMDD}-{suffix}` (`isValidProcessId`)  
5. **No side effects** — encode does not mint, settle fee, write NodeChain, or issue PoT  
