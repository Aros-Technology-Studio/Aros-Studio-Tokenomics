# Package signature

Optional bind of package identity to a key:

```
signingDigest = SHA-256(canonical({
  domain: "AST-TX-PACKAGE-v1",
  contentType, payloadHash, processId, processType, schemaVersion
}))
signature = Ed25519(signingDigest)
```

Used when an institution or service must attest the encoded package before hand-off.
