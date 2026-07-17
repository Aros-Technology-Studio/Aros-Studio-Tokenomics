# Encoding rules
1. JSON with sorted object keys (recursive).  
2. schemaVersion `ast-tx-1`.  
3. `payloadHash = SHA-256(utf8(encoded))`.  
4. Same logical body ⇒ same hash regardless of key insertion order.
