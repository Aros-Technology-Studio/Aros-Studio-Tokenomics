# Encoding rules

1. Validate against process-type schema.  
2. Normalize: trim strings, lowercase hashes.  
3. Build envelope: `{ body, processId, processType, schemaVersion }`  
4. Canonical JSON: recursive key sort, no whitespace, no undefined, no floats.  
5. `payloadHash = SHA-256(utf8(encoded))`  
6. schemaVersion: `ast-tx-2`  
