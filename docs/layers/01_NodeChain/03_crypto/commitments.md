# Commitments

## Purpose

Bind large or sensitive off-journal material to the ledger without storing plaintext SoT elsewhere.

```text
commitment = H(material ‖ domain_separator ‖ salt?)
```

Salt, if used, is recorded so commitment is reproducible.

## Use cases

- document packages (hash only on chain);  
- encrypted blob locators;  
- external evidence packages for PoT (PoT layer defines meaning).

## Rules

1. Commitment algorithm fixed in `algorithms.md`.  
2. Changing material without new record is detectable if verifiers re-hash.  
3. NodeChain does not retrieve external blobs; it only stores commitments + metadata.
