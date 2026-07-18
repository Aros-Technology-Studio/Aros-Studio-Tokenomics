# Integration — Processing

Processing supplies `ProcessState`:

- processId, processType, stagesCompleted  
- valuation, holderId  
- open payload flags (allowlist, docs, signature)  

PoT does not advance stages; after success, processing may `markPotDone`.
