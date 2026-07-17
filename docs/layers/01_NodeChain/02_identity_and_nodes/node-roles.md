# Node roles

## Fixed roles (v1)

| Role | Function relative to NodeChain |
|------|--------------------------------|
| **executor** | Runs process work; may submit operational records via authorized services |
| **confirmer** | Participates in confirmation / co-sign of appends where multi-writer required |
| **observer** | Read and audit; does not author economic or process appends |

Product may map institutional machines to these roles.  
One institution may run multiple nodes; **one vote / one cert** unless product law changes.

## What roles are not

- Not stake-weighted influence  
- Not “governance token” holders  
- Not ASE agents (ASE is supra-layer)

## Role vs writerRole

- **Node role:** network participant class.  
- **writerRole:** service identity on a single append (`orchestrator`, `pot`, …).  

A confirmer node may host services that use different writerRoles under allowlist.
