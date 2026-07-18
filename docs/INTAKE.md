# Intake (institutional process — no portal)

**ENV/DOC related:** process entry for asset tokenization without Issuer UI.

## Path

1. Institution package: valuation + documents + qualified signature flags  
2. Governance **L1** (allowlist, docs, signature)  
3. **L2** committee when required  
4. `TokenizationPipeline.runPrimaryTokenization` (layer 10)  
5. PoT P1–P4 → mint → commission 70/30 → reserve  
6. All-Seeing Eye observe/notify  

## CLI

```bash
npm run demo:tokenize -- --dir data/journal-rocks --engine rocksdb
```

## Signature verification (v1)

Flags `hasQualifiedSignature` / allowlist are process inputs.  
Production КЭП/X.509 validation is a follow-on (bind to nodes registration + intake policy).  
No portal upload surface in this repository.
