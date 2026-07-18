# 10_AssetTokenization

**Layer:** Institutional asset tokenization processes (no portal)  
**Code:** `src/intake/`  

## Processes

| Process | Method | processType |
|---------|--------|-------------|
| Primary tokenization | `runPrimaryTokenization` | primary_tokenization |
| Revaluation | `runRevaluation` | revaluation |
| Ownership transfer | `runOwnershipTransfer` | ownership_transfer |

## Flow (primary)

```
L1 → L2 → process_open + asset_register
  → PoT (attestations + P1–P4)
  → L3 panel
  → mintAfterPot
  → commission 70/30
  → reserve accrue
  → process_close
  → index mirror replay
```

## Modules

| File | Role |
|------|------|
| `tokenization.pipeline.ts` | orchestration |
| `asset-registry.ts` | asset projection + journal register |
| `process-id.ts` | AST-{INST}-{YYYYMMDD}-{suffix} |
| `document-package.ts` | package hash + validation |

## Demo

```bash
npm run demo:tokenize -- --engine rocksdb
```
