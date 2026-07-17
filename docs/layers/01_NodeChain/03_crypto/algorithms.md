# Algorithms (v1 defaults)

| Concern | v1 default | Notes |
|---------|------------|--------|
| Hash | SHA-256 | Content and chain |
| Node signatures | ECDSA P-256 or secp256k1 | Pick one in implementation; document choice |
| Transport | TLS 1.3 + mTLS | |
| At-rest | AES-256-GCM (or volume encryption) | |
| Money in payloads | decimal strings, 9 places for ARO | Storage only |

## Upgrades

Algorithm changes are **governance/parameter** events recorded on chain before use.  
Old records remain verifiable under their recorded algorithm id.

## Post-quantum

PQ-safe schemes are an allowed future upgrade path; not required for first implementation.
