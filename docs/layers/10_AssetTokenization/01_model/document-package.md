# Document package

```
{ documents: [{ name, contentHash }], hasQualifiedSignature, signerId? }
```

`hashDocumentPackage` → SHA-256 of canonical JSON.  
Must have ≥1 document and `hasQualifiedSignature === true` when provided.
