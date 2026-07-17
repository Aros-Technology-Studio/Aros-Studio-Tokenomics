# Node infrastructure (ops)

## Software baseline

- Node daemon capable of mTLS, journal client or replica role  
- Clock sync to UTC  
- Secure key storage for identity and signing keys  

## Hardware (guidance, not economic canon)

| Resource | Suggested minimum |
|----------|-------------------|
| CPU | 4 vCores |
| RAM | 16 GB |
| Storage | 512 GB SSD (journal growth) |
| Network | ≥ 100 Mbps, stable |

## Heartbeats

Nodes emit heartbeats; default target uptime **95%** (ops).  
Missed heartbeats feed standing/suspension logic.

## Rotation (optional ops)

Periodic rotation of active confirmers based on reliability metrics — recorded when membership sets change.

## Geo

Geographic placement configurable; not a tokenomic parameter.
