# 02_TxEncoding

**Status:** v1 draft complete (docs + code `src/tx-encoding`)  
**Issue:** LAYER 02 tx_encoding  
**Role:** Deterministic encoding of process transaction payloads.

## Job
Produce a canonical byte/string representation and `payloadHash` so the same process body always hashes the same way (determinism / I4-style).

## Non-goals
- PoT verdict, mint, UI, sharding mesh

## Code
- `src/tx-encoding/encode.ts` — `encodeProcessTx`, `canonicalEncode`, `payloadHash`

## Docs
- `00_scope/`, `01_model/`, `03_api/`, `09_acceptance/`
