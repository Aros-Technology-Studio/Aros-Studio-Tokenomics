# Encode flow

```
raw input
  → validateAndNormalize (schema)
  → envelope
  → canonicalEncode
  → payloadHash
  → EncodedProcessTx
  → (optional) signPackage
  → Processing process_open stores payloadHash + encoded
```
