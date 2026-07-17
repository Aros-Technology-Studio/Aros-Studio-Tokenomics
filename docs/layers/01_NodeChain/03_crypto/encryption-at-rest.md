# Encryption at rest

## Requirement

Primary journal storage uses **encryption at rest** (volume or application-level).  
v1: required (P0–P4).

## What is stored

| Data | At rest |
|------|---------|
| Journal records | Encrypted store |
| Snapshots | Encrypted store |
| Key material | HSM/OS key store — never in git |

## Application-level option

Sensitive payload fields may be encrypted with process-scoped keys; journal still stores ciphertext + commitment so integrity remains.

## Not in v1 core

Per-field multi-node “no one sees full tx” sharding mesh — optional future privacy package, not required for SoT ledger.
