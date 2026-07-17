# Transport security

## Model

Zero-trust service mesh: no implicit trust by IP.

| Control | Rule |
|---------|------|
| mTLS | Mutual certificate authentication |
| No public anonymous append API | Append only for authenticated writers |
| Signed messages | Challenge-response for key possession |

## Threats mitigated

- spoofed writers  
- passive eavesdropping on the wire  
- trivial node impersonation without cert

## Relation to ASE

Transport logs and anomalies may be exported to ASE observation; transport does not implement ASE policy.
