# Write-ahead

1. `pot_evidence` is appended before client treats verification as complete.  
2. `pot_verdict` is appended with link to evidence height/id.  
3. Emission/settlement may run only after `pot_verdict` is durable (known `ledgerHeight`).  

Ack of “tokenized” to any external party without these records is a canon violation.
