# Boundaries

**In:** processId, processType, body fields  
**Out:** EncodedProcessTx { encoded, payloadHash, body }  

Processing calls EncodingService before `process_open`.  
PoT reads payloadHash / stages from journal — does not re-encode economics.
