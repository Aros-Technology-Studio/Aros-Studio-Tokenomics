# 10_AssetTokenization

**Status:** v1 draft + code `src/intake/tokenization.pipeline.ts`  
**Issue:** LAYER 10 asset_tokenization  
**Role:** Primary RWA tokenization **process** (no portal):  
L1 → open/encode → PoT → mint → commission 70/30 → reserve accrue → close — all journaled.

## Demo
```
npm run demo:tokenize -- --dir data/journal
```
